import json
import logging

from simple_history.utils import bulk_create_with_history

from biblios.models import CloudService, TextBlock
from biblios.services.suggestions import generate_suggestions

logger = logging.getLogger("django")


class BaseExtractor(object):
    """
    Base class for extraction services, to hold common structure and logic.
    To implementation a new service, override the internal methods as needed:
      __get_extraction__: handles the request/response to the extraction service
      __filter__: process the response, i.e. remove non-word objects
      __create_text_block__: convert a single word object from the response to TextBlock-compatible dict

    """

    service = None

    # Override this is your extractor service uses a different attribute for the TextBlock's text
    word_attr = "Text"

    def __init__(self, page):
        self.page = page
        self.distinct_words = set()
        self.spelling_candidates = {}

    def __str__(self):
        return f"{self.service} Extractor"

    def __get_extraction__(self):
        return []

    def __filter__(self, res):
        """
        Method to split word and non-word items from the extraction response.
        `res` is a list from json.loads().
        This method should return three subsets of items from it: words, lines, and then the remainder
        """
        words = res
        lines = []
        others = []
        return words, lines, others

    def _process_lines__(self, lines):
        return lines

    def __process_others__(self, others):
        return others

    def __generate_line_numbers__(self, lines):
        return [
            0,
        ]

    # Override this method with specifics about how to translate an extraction service's response to a TextBlock
    def __create_text_block__(self, word):
        """Generate a text block for cleaning."""

        # Note that this method gets called indirectly via check_text
        return {
            "extraction_id": None,
            "text": word,
            "text_type": None,
            "confidence": None,
            "suggestions": None,
            "geo_x_0": None,
            "geo_y_0": None,
            "geo_x_1": None,
            "geo_y_1": None,
        }

    # Don't override this; it has safety checks to keep invalid textblocks from being loaded
    def __clean_block__(self, word):
        """Safely extract a text block."""

        textblock = self.__create_text_block__(word)

        # A confidence score of exactly 100 causes a decimal.InvalidOperation error.
        # Cap it to the "accepted" level.
        textblock.confidence = min(textblock.confidence, TextBlock.CONF_ACCEPTED)

        # If the text reaches the exact edge of the image, that causes a decimal.InvalidOperation error.
        # Nudge it in just slightly.
        for coord in ("geo_x_0", "geo_y_0", "geo_x_1", "geo_y_1"):
            c = getattr(textblock, coord)
            setattr(textblock, coord, max(c, 0.000000000000001))
            setattr(textblock, coord, min(c, 0.999999999999999))

        return textblock

    # Ideally, don't override this.
    # This can take a while because of the spellchecking. Best to call it through tasks.queue_extraction().
    def get_words(self):
        logger.info(f"Extracting {self.page} with {self.service}")
        response = self.__get_extraction__()

        words, lines, others = self.__filter__(response)
        self.lines = self.__process_lines__(lines)
        self.others = self.__process_others__(others)
        self.line_numbers = self.__generate_line_numbers__(self.lines)

        # Loop through the response words and create new text blocks for them.
        # As we do this, generate spellcheck candidates for each unique word.
        # This is currently case-sensitive and not aware of punctuation, and we can get
        # bigger performance gains there with some more work.
        new_text = []
        for w in words:
            text = w.get(self.word_attr)
            if text not in self.distinct_words:
                self.distinct_words.add(text)
                self.spelling_candidates[text] = generate_suggestions(
                    text, self.page.document.use_long_s_detection
                )

            new_text.append(self.__clean_block__(w))

        logger.info(f"Found {len(self.distinct_words)} distinct words")

        bulk_create_with_history(new_text, TextBlock)

        return new_text


class AWSExtractor(BaseExtractor):
    service = "Amazon Web Services"

    def __get_extraction__(self):
        import boto3

        service = self.page.document.series.collection.owner.cloudservice
        client = boto3.client(
            "textract",
            region_name="us-east-1",
            aws_access_key_id=service.client_id,
            aws_secret_access_key=service.client_secret,
        )

        # Get the bytes of the page image to send to Textract
        image = self.page.image.file.file.read()

        logger.info("Submitting Textract request")

        # https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/textract/client/detect_document_text.html
        extracted_page = client.detect_document_text(Document={"Bytes": image})

        logger.info("Textract response received")
        return extracted_page["Blocks"]

    def __filter__(self, res):
        """
        Filter the Textract response to just word blocks.
        """
        words = []
        lines = []
        others = []
        for block in res:
            if block["BlockType"] == "WORD":
                words.append(block)
            elif block["BlockType"] == "LINE":
                lines.append(block)
            else:
                others.append(block)

        return words, lines, others

    def __process_lines__(self, lines):
        relationships = {}
        for block in lines:
            # For lines, record each child as a key in that dict.
            # Using the line's top point and its index as the value gives us sortability.
            # All lines *should* have Relationships but it's not clear whether that's a guarantee.
            rel = block.get("Relationships", [])
            top = block["Geometry"]["BoundingBox"]["Top"]
            children = rel.pop()
            for child in children["Ids"]:
                relationships[child] = (top, children["Ids"].index(child))
        return relationships

    def __generate_line_numbers__(self, lines):
        numbers = []
        for line in lines.values():
            if line[0] not in numbers:
                numbers.append(line[0])
        numbers.sort()
        return numbers

    def __create_text_block__(self, word):
        text_type = (
            TextBlock.PRINTED if word["Text"] == "PRINTED" else TextBlock.HANDWRITING
        )

        position = self.lines[word["Id"]]

        return TextBlock(
            extraction_id=word["Id"],
            page=self.page,
            text=word["Text"],
            text_type=text_type,
            line=self.line_numbers.index(position[0]),
            number=position[1],
            confidence=word["Confidence"],
            # TextBlock does this on save(), but the bulk create process bypasses that
            suggestions=self.spelling_candidates[word["Text"]],
            geo_x_0=word["Geometry"]["Polygon"][0]["X"],
            geo_y_0=word["Geometry"]["Polygon"][0]["Y"],
            geo_x_1=word["Geometry"]["Polygon"][2]["X"],
            geo_y_1=word["Geometry"]["Polygon"][2]["Y"],
        )


class TestExtractor(AWSExtractor):
    service = "Dummy Service"

    def __get_extraction__(self):
        with open("biblios/tests/textract_response.json") as j:
            response = json.load(j)
        return response["Blocks"]


EXTRACTORS = {CloudService.TEST: TestExtractor, CloudService.AWS: AWSExtractor}

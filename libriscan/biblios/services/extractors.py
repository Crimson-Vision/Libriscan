import json
import logging

from biblios.models import CloudService, TextBlock
from biblios.services.suggestions import generate_suggestions

logger = logging.getLogger(__name__)


class BaseExtractor(object):
    """
    Base class for extraction services, to hold common structure and logic.
    To implementation a new service, override the internal methods as needed:
      __get_extraction__: handles the request/response to the extraction service
      __filter__: process the response, i.e. remove non-word objects
      __create_text_block__: convert a single word object from the response to TextBlock-compatible dict

    """

    service = None

    def __init__(self, page):
        self.page = page

    def __str__(self):
        return f"{self.service} Extractor"

    def __get_extraction__(self):
        return []

    def __filter__(self, res):
        """
        Method to remove non-word items from the extraction response.
        `res` is a list from json.loads(), and this method should return a subset of items from it
        """
        return res

    def __create_text_block__(self, word):
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

    # Ideally, don't override this.
    # This can take a while because of the spellchecking. Best to call it through tasks.queue_extraction().
    def get_words(self):
        logger.info(f"Extracting {self.page} with {self.service}")
        response = self.__get_extraction__()
        words = [self.__create_text_block__(w) for w in self.__filter__(response)]

        TextBlock.objects.bulk_create(words)

        return words


class TestExtractor(BaseExtractor):
    service = "Test Service"

    def __get_extraction__(self):
        with open("biblios/tests/textract_response.json") as j:
            response = json.load(j)
        return response["Blocks"]

    def __create_text_block__(self, word):
        text_type = (
            TextBlock.PRINTED if word["Text"] == "PRINTED" else TextBlock.HANDWRITING
        )
        return TextBlock(
            extraction_id=word["Id"],
            page=self.page,
            text=word["Text"],
            text_type=text_type,
            confidence=word["Confidence"],
            # TextBlock does this on save(), but the bulk create process bypasses its method override
            suggestions=generate_suggestions(
                word["Text"], self.page.document.use_long_s_detection
            ),
            geo_x_0=word["Geometry"]["Polygon"][0]["X"],
            geo_y_0=word["Geometry"]["Polygon"][0]["Y"],
            geo_x_1=word["Geometry"]["Polygon"][2]["X"],
            geo_y_1=word["Geometry"]["Polygon"][2]["Y"],
        )

    def __filter__(self, res):
        return [r for r in res if r["BlockType"] == "WORD"]


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
        return [r for r in res if r["BlockType"] == "WORD"]

    def __create_text_block__(self, word):
        text_type = (
            TextBlock.PRINTED if word["Text"] == "PRINTED" else TextBlock.HANDWRITING
        )

        return TextBlock(
            extraction_id=word["Id"],
            page=self.page,
            text=word["Text"],
            text_type=text_type,
            confidence=word["Confidence"],
            # TextBlock does this on save(), but the bulk create process bypasses its method override
            suggestions=generate_suggestions(
                word["Text"], self.page.document.use_long_s_detection
            ),
            geo_x_0=word["Geometry"]["Polygon"][0]["X"],
            geo_y_0=word["Geometry"]["Polygon"][0]["Y"],
            geo_x_1=word["Geometry"]["Polygon"][2]["X"],
            geo_y_1=word["Geometry"]["Polygon"][2]["Y"],
        )


EXTRACTORS = {CloudService.TEST: TestExtractor, CloudService.AWS: AWSExtractor}

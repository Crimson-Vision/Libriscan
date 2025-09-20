import json
from django.http import HttpResponse
from PIL import Image

from .models import CloudService, Page, TextBlock


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
        self.image = None
        self.page = page

    def __str__(self):
        return f"{self.service} Extractor"

    def __get_extraction__(self):
        from .tests import mock_extraction

        return json.loads(mock_extraction)

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
            "geo_x_0": None,
            "geo_y_0": None,
            "geo_x_1": None,
            "geo_y_1": None,
        }

    def get_words(self):
        response = self.__get_extraction__()
        words = [self.__create_text_block__(w) for w in self.__filter__(response)]

        TextBlock.objects.bulk_create(words)

        return words

    def process_image(self, image):
        try:
            image = Image.open(image)
        except OSError as e:
            return HttpResponse(f"Error: {e}", status=400)
        except Exception as e:
            return HttpResponse(f"Something went wrong: {e}", status=500)
        else:
            self.image = image
            return HttpResponse("Image saved", status=200)


class TestExtractor(BaseExtractor):
    service = "Test Service"

    def __create_text_block__(self, word):
        return {
            "extraction_id": word["Id"],
            "text": word["Text"].upper(),
            "text_type": word["TextType"],
            "confidence": word["Confidence"],
            "geo_x_0": word["Geometry"]["Polygon"][0]["X"],
            "geo_y_0": word["Geometry"]["Polygon"][0]["Y"],
            "geo_x_1": word["Geometry"]["Polygon"][2]["X"],
            "geo_y_1": word["Geometry"]["Polygon"][2]["Y"],
        }


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

        # https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/textract/client/detect_document_text.html
        extracted_page = client.detect_document_text(Document={'Bytes':image})

        return extracted_page["Blocks"]

    def __filter__(self, res):
        """
        Filter the Textract response to just word blocks.
        """
        return [r for r in res if r["BlockType"] == "WORD"]

    def __create_text_block__(self, word):

        text_type = TextBlock.PRINTED if word["Text"] == "PRINTED" else TextBlock.HANDWRITING

        return TextBlock(
            extraction_id=word["Id"],
            page=self.page,
            text=word["Text"],
            text_type=text_type,
            confidence=word["Confidence"],
            geo_x_0=word["Geometry"]["Polygon"][0]["X"],
            geo_y_0=word["Geometry"]["Polygon"][0]["Y"],
            geo_x_1=word["Geometry"]["Polygon"][2]["X"],
            geo_y_1=word["Geometry"]["Polygon"][2]["Y"],
        )


EXTRACTORS = {CloudService.TEST: TestExtractor, CloudService.AWS: AWSExtractor}

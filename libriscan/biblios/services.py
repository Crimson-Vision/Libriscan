import json
from django.http import JsonResponse, HttpResponse
from PIL import Image

from .models import CloudService

class BaseExtractor(object):
    service = None

    def __init__(self):
        self.image = None

    def __str__(self):
        return f"{self.service} Extractor"

    def process_image(self, image):
        try:
            image = Image.open(image)
        except OSError as e:
            return HttpResponse(F"Error: {e}", status=400)
        except Exception as e:
            return HttpResponse(F"Something went wrong: {e}", status=500)
        else:
            self.image = image
            return HttpResponse("Image saved", status=200)

    def extract(self):
        return HttpResponse("extraction requested", status=501)

    
class TestExtractor(BaseExtractor):
    service = "Test Service"

    def process_image(self, image):
        self.image = image

    def extract(self):
        from .tests import mock_extraction
        
        return json.loads(mock_extraction)


class AWSExtractor(BaseExtractor):
    service = "Amazon Web Services"

    def extract(self):
        return HttpResponse("Haven't built this yet", status=501)
    

EXTRACTORS = {
    CloudService.TEST: TestExtractor,
    CloudService.AWS: AWSExtractor
}




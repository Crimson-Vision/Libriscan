import json

from django.test import TestCase

from unittest.mock import patch

from biblios.models import Document, Page, TextBlock
from biblios.services import AWSExtractor


class AWSExtractorTests(TestCase):
    
    fixtures = ["orgs", "collections", "series", "docs"]

    def setUp(self):
        doc = Document.objects.first()
        self.page = Page.objects.create(document=doc)

    def test_aws_extractor(self):
        with open('biblios/tests/textract_response.json') as j:
            response = json.load(j)

        # The test json has a dummy string in the metadata to confirm the test hasn't accidentally
        # called the real service.
        self.assertEqual(response["DocumentMetadata"]["TestData"], "True")
        
        with patch.object(AWSExtractor, '__get_extraction__', return_value=response["Blocks"]):

            aws = AWSExtractor(self.page)
                
            words = aws.get_words()
            self.assertEqual(len(words), 387)

            blocks = self.page.textblock_set.all()
            self.assertEqual(blocks.first().text, 'ROW')
            self.assertEqual(blocks.count(), 387)








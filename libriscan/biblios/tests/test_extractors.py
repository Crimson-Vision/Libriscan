from django.test import TestCase
from unittest.mock import patch

class ExtractorTests(TestCase):
    fixtures = ["orgs", "collections", "series", "docs"]

    def test_aws_extractor(self):
        return True

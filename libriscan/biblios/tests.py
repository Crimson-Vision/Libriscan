from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

from .models import Series, Document


class UserModelTests(TestCase):
    def setUp(self):
        pass

    def test_using_custom_user(self):
        """
        Libriscan should be using the custom User model
        """
        user_model = get_user_model()
        self.assertIs(user_model._meta.app_label, "biblios")


class BibliosTests(TestCase):
    fixtures = ['orgs', 'collections', 'series', 'docs']

    # The unique constraint tests are confirming that the constraints are applied as intended,
    # not that they generally work.

    def test_unique_doc_constraint(self):
        d = Document.objects.first()
        s = Series.objects.create(collection=d.series.collection, name="Test series")
        d2 = Document.objects.create(series=s)
        try:
            d2.identifier = d.identifier
            d2.save()
            passes = True
        except IntegrityError:
            passes = False
                
        self.assertTrue(passes)





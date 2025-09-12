from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

from .models import Series, Document, Organization, UserRole


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

    def test_unique_docs(self):
        # Checking that the constraint isn't being applied across different series
        d = Document.objects.first()
        s = Series.objects.create(collection=d.series.collection, name="Test series")
        
        try:
            Document.objects.create(series=s, identifier=d.identifier)
            passes = True
        except IntegrityError:
            passes = False
                
        self.assertTrue(passes)


    def test_unique_user_roles(self):
        # Checking the constraint doesn't block a user from having different roles, 
        # or different users from having the same role in an org
        user_model = get_user_model()
        u = user_model.objects.create(username="tester")
        org = Organization.objects.first()
        UserRole.objects.create(user=u, organization=org, role=UserRole.EDITOR)

        try:
            new_user = user_model.objects.create(username="tester2")
            UserRole.objects.create(user=new_user, organization=org, role=UserRole.EDITOR)
            UserRole.objects.create(user=u, organization=org, role=UserRole.ADMIN)
            passes = True
        except IntegrityError:
            passes = False
        
        self.assertTrue(passes)






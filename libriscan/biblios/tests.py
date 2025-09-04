from django.test import TestCase
from django.contrib.auth import get_user_model

from .models import User


class UserModelTests(TestCase):
    def setUp(self):
        pass

    def test_using_custom_user(self):
        """
        Libriscan should be using the custom User model
        """
        user_model = get_user_model()
        self.assertIs(user_model._meta.app_label, "biblios")

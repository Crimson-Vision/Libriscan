from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

from biblios.models import Document, Organization, UserRole, TextBlock, Page


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
    fixtures = ["orgs", "collections", "series", "docs", "pages", "text"]

    def setUp(self):
        self.factory = RequestFactory()
        self.user = get_user_model().objects.create_user(
            email="test@crimson-vision.tech", password="my-luggage-combo"
        )
        UserRole.objects.create(
            user=self.user,
            organization=Organization.objects.get(id=1),
            role=UserRole.ARCHIVIST,
        ).save()

    # The unique constraint tests are confirming that the constraints are applied as intended,
    # not that they generally work.

    def test_unique_docs(self):
        # Checking that the constraint isn't being applied across different series
        d = Document.objects.first()

        with self.assertRaises(IntegrityError):
            Document.objects.create(collection=d.collection, identifier=d.identifier)

    def test_unique_user_roles(self):
        # Checking the constraint doesn't block a user from having different roles,
        # or different users from having the same role in an org
        user_model = get_user_model()
        u = user_model.objects.create(email="1@2.com")
        org = Organization.objects.first()
        UserRole.objects.create(user=u, organization=org, role=UserRole.EDITOR)

        try:
            new_user = user_model.objects.create(email="2@2.com")
            UserRole.objects.create(
                user=new_user, organization=org, role=UserRole.EDITOR
            )
            UserRole.objects.create(user=u, organization=org, role=UserRole.ARCHIVIST)
            passes = True
        except IntegrityError:
            passes = False

        self.assertTrue(passes)

    def test_login_is_reachable(self):
        # Checking that the login required middleware doesn't cause redirect loops when logging in
        from libriscan.settings import LOGIN_URL

        response = self.client.get(LOGIN_URL, follow=True)
        # The redirect should only be one hop
        self.assertEqual(len(response.redirect_chain), 1)
        # The page can be successfully reached
        self.assertEqual(response.status_code, 200)

    def test_merge_textblocks(self):
        # Check that two blocks can be merged correctly
        from biblios.views import merge_blocks
        import json

        # Test that words on different lines can't be merged
        block1 = 20
        block2 = 21

        page = Page.objects.get(id=1)

        request = self.factory.post("merge", {"block1": block1, "block2": block2})
        request.user = self.user

        response = merge_blocks(
            request,
            page.document.series.collection.owner.short_name,
            page.document.series.collection.slug,
            page.document.identifier,
            page.number,
        )

        self.assertEqual(
            json.loads(response.text).get("error"),
            "Only sequential text on the same line can be merged",
        )
        self.assertEqual(response.status_code, 400)

        # Test that words next to each other on the same line can be merged
        block3 = 29
        block4 = 30

        request = self.factory.post("merge", {"block1": block3, "block2": block4})
        request.user = self.user

        response = merge_blocks(
            request,
            page.document.series.collection.owner.short_name,
            page.document.series.collection.slug,
            page.document.identifier,
            page.number,
        )

        b3 = TextBlock.objects.get(id=block3)
        b4 = TextBlock.objects.get(id=block4)

        new = json.loads(response.text).get("new")

        # Don't check the whole thing, but make sure the new text block at least has the correctly merged text
        self.assertEqual(new.get("text"), f"{b3.text}{b4.text}")

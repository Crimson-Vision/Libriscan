from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError


from biblios.models import Document, Organization, UserRole, TextBlock, Page

import logging

logger = logging.getLogger("django")


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

        # Test that the first printable word on a line can't be merged
        # Block 10 is the third word on the line in the fixture, but 8 and 9 are marked Omit
        block1 = 10

        page = Page.objects.get(id=1)

        request = self.factory.post("merge", {"block": block1})
        request.user = self.user

        response = merge_blocks(
            request,
            page.document.collection.owner.short_name,
            page.document.collection.slug,
            page.document.identifier,
            page.number,
        )

        self.assertEqual(
            json.loads(response.text).get("error"),
            "The selected word must have another printable word before it on the same line",
        )
        self.assertEqual(response.status_code, 400)

        # Test that words next to each other on the same line can be merged
        block3 = 29
        block4 = 30

        request = self.factory.post("merge", {"block": block4})
        request.user = self.user

        response = merge_blocks(
            request,
            page.document.collection.owner.short_name,
            page.document.collection.slug,
            page.document.identifier,
            page.number,
        )

        b3 = TextBlock.objects.get(id=block3)
        b4 = TextBlock.objects.get(id=block4)

        new = json.loads(response.text).get("new")

        # Don't check the whole thing, but make sure the new text block at least has the correctly merged text
        self.assertEqual(new.get("text"), f"{b3.text}{b4.text}")

    def test_update_word(self):
        """Test updating a TextBlock's text from the front end."""
        from biblios.views import update_word
        from decimal import Decimal

        word = TextBlock.objects.get(id=1)

        new_text = "KNOW"

        self.assertNotEqual(word.text, new_text)
        self.assertNotEqual(word.confidence, word.CONF_ACCEPTED)

        request = self.factory.post("update_word", {"text": new_text})
        request.user = self.user

        update_word(
            request,
            word.page.document.collection.owner.short_name,
            word.page.document.collection.slug,
            word.page.document.identifier,
            word.page.number,
            word.id,
        )

        word = TextBlock.objects.get(id=1)

        self.assertEqual(word.text, new_text)
        self.assertEqual(word.confidence, Decimal(str(word.CONF_ACCEPTED)))

    def test_update_print_control(self):
        """Test updating a TextBlock's word visibility control from the front end."""
        from biblios.views import update_print_control

        word = TextBlock.objects.get(id=1)

        new_print_control = word.OMIT

        self.assertNotEqual(word.print_control, word.OMIT)

        request = self.factory.post(
            "update_print_control", {"print_control": new_print_control}
        )
        request.user = self.user

        update_print_control(
            request,
            word.page.document.collection.owner.short_name,
            word.page.document.collection.slug,
            word.page.document.identifier,
            word.page.number,
            word.id,
        )

        word = TextBlock.objects.get(id=1)

        self.assertEqual(word.print_control, new_print_control)

    def test_revert_word(self):
        """Test reverting a TextBlock's from the front end."""
        from biblios.views import revert_word

        # Clone the first textblock, just to make sure we have a normal audit history
        word = TextBlock.objects.get(id=1)
        word.pk = None
        word.save()

        e = word.history.earliest()
        original_word = e.text

        word.text = f"{word.text}abcde12345"
        word.save()

        # Confirm that the word has been changed
        self.assertNotEqual(word.text, original_word)

        request = self.factory.post("revert_word")
        request.user = self.user

        revert_word(
            request,
            word.page.document.collection.owner.short_name,
            word.page.document.collection.slug,
            word.page.document.identifier,
            word.page.number,
            word.id,
        )

        # Check that the textblock has been reverted to the original
        word = TextBlock.objects.get(id=word.id)
        self.assertEqual(word.text, original_word)

        # Check that the textblock has the "reverted" reason
        latest = word.history.latest()
        self.assertEqual(latest.history_change_reason, "Revert to original")

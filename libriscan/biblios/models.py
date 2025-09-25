import rules
from rules.contrib.models import RulesModelMixin, RulesModelBase

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.functional import cached_property
from django.utils.translation import gettext_lazy as _

from localflavor.us.us_states import STATE_CHOICES
from localflavor.us.models import USStateField

from biblios.access_rules import is_org_archivist, is_org_editor, is_org_viewer
from biblios.managers import CustomUserManager
from biblios.services.suggestions import long_s_conversion, generate_suggestions


# Customized for email-based usernames per https://testdriven.io/blog/django-custom-user-model/
class User(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email


# Custom model in case there's a need for anything more than just the rules meta class
class BibliosModel(models.Model, RulesModelMixin, metaclass=RulesModelBase):
    class Meta:
        abstract = True


# This model is what we'll use for libraries, but calling it Org for two reasons:
# Trying to avoid ambiguity with software libraries, and maybe non-library orgs could use this someday
class Organization(BibliosModel):
    name = models.CharField(max_length=75)
    short_name = models.SlugField(max_length=5)
    city = models.CharField(max_length=25)
    state = USStateField(choices=STATE_CHOICES)

    class Meta:
        rules_permissions = {
            "add": rules.is_superuser,
            "view": is_org_viewer,
            "change": is_org_archivist,
            "delete": rules.is_superuser,
        }

    def __str__(self):
        return self.name


class CloudService(models.Model):
    TEST = "T"
    AWS = "A"
    SERVICE_CHOICES = {TEST: "Test", AWS: "Amazon Web Services"}

    organization = models.OneToOneField(Organization, on_delete=models.CASCADE)
    service = models.CharField(max_length=1, choices=SERVICE_CHOICES)
    client_id = models.CharField(max_length=100)
    client_secret = models.CharField(max_length=100)

    def __str__(self):
        return self.SERVICE_CHOICES[self.service]

    def get_extractor(self, page):
        from .services.extractors import EXTRACTORS

        return EXTRACTORS[self.service](page)


class Consortium(BibliosModel):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


# Using a through model for consortium membership, since there's probably additional info useful for us to track
class Membership(BibliosModel):
    pk = models.CompositePrimaryKey("organization_id", "consortium_id")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    consortium = models.ForeignKey(Consortium, on_delete=models.CASCADE)


class Collection(BibliosModel):
    owner = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)

    class Meta:
        rules_permissions = {
            "add": is_org_archivist,
            "change": is_org_archivist,
            "delete": is_org_archivist,
            "view": is_org_viewer,
        }

    def __str__(self):
        return self.name


class Series(BibliosModel):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)

    class Meta:
        rules_permissions = {
            "add": is_org_editor,
            "view": is_org_viewer,
            "change": is_org_editor,
            "delete": is_org_editor,
        }

    def __str__(self):
        return self.name


class Document(BibliosModel):
    series = models.ForeignKey(Series, on_delete=models.CASCADE)
    identifier = models.CharField(max_length=25)
    
    # Spelling suggestion rules
    use_long_s_detection = models.BooleanField(default=True)

    class Meta:
        # In theory this would be better as a unique identifer per collection
        constraints = [
            models.UniqueConstraint(
                fields=["series", "identifier"], name="unique_doc_per_org"
            )
        ]
        rules_permissions = {
            "add": is_org_editor,
            "view": is_org_viewer,
            "change": is_org_editor,
            "delete": is_org_editor,
        }

    def __str__(self):
        return self.identifier


class Page(BibliosModel):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    number = models.SmallIntegerField(default=1)
    image = models.ImageField(blank=True, upload_to="pages")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["document", "number"], name="unique_page")
        ]
        rules_permissions = {
            "add": is_org_editor,
            "view": is_org_viewer,
            "change": is_org_editor,
            "delete": is_org_editor,
        }

    def __str__(self):
        return f"{self.document} page {self.number}"
    
    @property
    def has_extraction(self):
        return self.textblock_set.exists()


class TextBlock(BibliosModel):
    PRINTED = "P"
    HANDWRITING = "H"
    TEXT_TYPE_CHOICES = {PRINTED: "Printed", HANDWRITING: "Handwriting"}

    INCLUDE = 'I'
    MERGE = 'M'
    OMIT = 'O'
    PRINT_CONTROL_CHOICES = {INCLUDE: "Include", MERGE: "Merge With Prior", OMIT: "Omit"}

    page = models.ForeignKey(Page, on_delete=models.CASCADE)

    # Extraction ID refers to a single element on the page that is identified as a text block.
    extraction_id = models.CharField(max_length=50, blank=True)

    # As the text contained in the text block changes, the sequence increments to track a version history
    sequence = models.SmallIntegerField(default=1)

    text = models.CharField(max_length=255)
    text_type = models.CharField(max_length=1, choices=TEXT_TYPE_CHOICES)
    confidence = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    # Controls whether this word should be included from document exports.
    # Include: a normal word to include in the exported file
    # Merge With Prior: a word fragment; don't include the text, and extend the previous word's bounding box
    # Omit: leave it out completely
    print_control = models.CharField(max_length=1, choices=PRINT_CONTROL_CHOICES, default=INCLUDE)

    # The bounding box is recorded as the bottom-left corner (X,Y 0) and top-right corner (X,Y 1)
    # Textract returns values that are percentages of the page width, so these need to be decimals too
    geo_x_0 = models.DecimalField(
        max_digits=20,
        decimal_places=20,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
    )
    geo_y_0 = models.DecimalField(
        max_digits=20,
        decimal_places=20,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
    )
    geo_x_1 = models.DecimalField(
        max_digits=20,
        decimal_places=20,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
    )
    geo_y_1 = models.DecimalField(
        max_digits=20,
        decimal_places=20,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["page", "extraction_id", "sequence"],
                name="unique_textblock_sequence",
            )
        ]
        indexes = [
            models.Index(fields=["geo_x_0", "geo_y_0"]),
        ]
        rules_permissions = {
            "add": is_org_editor,
            "view": is_org_viewer,
            "change": is_org_editor,
            "delete": is_org_editor,
        }


    def __str__(self):
        return self.text
    
    @cached_property
    def suggestions(self):
        """Get spellcheck suggestions for the word, including any special checks like long-s detection"""
        words = [self.text,]

        # Check for potential long-s variants, if the doc expects any.
        if self.page.document.use_long_s_detection:
            s_word = long_s_conversion(self.text)
            if s_word != self.text:
                words.append(s_word)

        return generate_suggestions(words)



class UserRole(models.Model):
    EDITOR = "E"
    ARCHIVIST = "A"
    GUEST = "G"

    ROLE_CHOICES = {EDITOR: "Editor", ARCHIVIST: "Archivist", GUEST: "Guest"}

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=1, choices=ROLE_CHOICES)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "organization", "role"], name="unique_roles"
            )
        ]

    def __str__(self):
        return f"{self.organization} {UserRole.ROLE_CHOICES[self.role]}"

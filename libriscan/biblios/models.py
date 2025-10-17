import logging

import rules
from rules.contrib.models import RulesModelMixin, RulesModelBase

from django.db import models
from django.urls import reverse

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.functional import cached_property
from django.utils.translation import gettext_lazy as _

from localflavor.us.us_states import STATE_CHOICES
from localflavor.us.models import USStateField

from simple_history.models import HistoricalRecords

from biblios.access_rules import is_org_archivist, is_org_editor, is_org_viewer
from biblios.managers import CustomUserManager
from biblios.tasks import queue_extraction

logger = logging.getLogger(__name__)


# Customized for email-based usernames per https://testdriven.io/blog/django-custom-user-model/
class User(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    history = HistoricalRecords()

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
    short_name = models.SlugField(max_length=10)
    city = models.CharField(max_length=25)
    state = USStateField(choices=STATE_CHOICES)
    primary = models.BooleanField(default=False)
    history = HistoricalRecords()

    class Meta:
        rules_permissions = {
            "add": rules.is_superuser,
            "view": is_org_viewer,
            "change": is_org_archivist,
            "delete": rules.is_superuser,
        }
        constraints = [
            models.UniqueConstraint(fields=["short_name"], name="unique_org_shortname")
        ]

    def __str__(self):
        return self.name

    def clean(self, *args, **kwargs):
        # If this instance is set as primary, confirm there are no others already
        if self.primary and (prim_org := Organization.get_primary()):
            # But it's not a problem if this already *is* the primary
            if self is not prim_org:
                raise ValidationError(
                    "There can be only one primary organization at a time."
                )
        super().clean(*args, **kwargs)

    def get_absolute_url(self):
        keys = {"short_name": self.short_name}
        return reverse("organization", kwargs=keys)

    def get_primary():
        """Return the primary organization"""
        return Organization.objects.filter(primary=True).first()


class CloudService(models.Model):
    TEST = "T"
    AWS = "A"
    SERVICE_CHOICES = {TEST: "Test", AWS: "Amazon Web Services"}

    organization = models.OneToOneField(Organization, on_delete=models.CASCADE)
    service = models.CharField(max_length=1, choices=SERVICE_CHOICES)
    client_id = models.CharField(max_length=100)
    client_secret = models.CharField(max_length=100)
    history = HistoricalRecords()

    def __str__(self):
        return self.SERVICE_CHOICES[self.service]

    @cached_property
    def extractor(self):
        from .services.extractors import EXTRACTORS

        return EXTRACTORS[self.service]


class Collection(BibliosModel):
    owner = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="collections"
    )
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50)
    history = HistoricalRecords()

    class Meta:
        rules_permissions = {
            "add": is_org_archivist,
            "change": is_org_archivist,
            "delete": is_org_archivist,
            "view": is_org_viewer,
        }
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "slug"], name="unique_collection_slug"
            )
        ]

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        keys = {"short_name": self.owner.short_name, "collection_slug": self.slug}
        return reverse("collection", kwargs=keys)


class Series(BibliosModel):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50)
    history = HistoricalRecords()

    class Meta:
        rules_permissions = {
            "add": is_org_editor,
            "view": is_org_viewer,
            "change": is_org_editor,
            "delete": is_org_editor,
        }
        constraints = [
            models.UniqueConstraint(
                fields=["collection", "slug"], name="unique_series_slug"
            )
        ]

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        keys = {
            "short_name": self.collection.owner.short_name,
            "collection_slug": self.collection.slug,
            "series_slug": self.slug,
        }
        return reverse("series", kwargs=keys)


class Document(BibliosModel):
    series = models.ForeignKey(
        Series, on_delete=models.CASCADE, related_name="documents"
    )
    identifier = models.SlugField(max_length=25)
    history = HistoricalRecords()

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

    def save(self, *args, **kwargs):
        """Save the document, and create its metadata record if necessary."""
        s = super(Document, self).save(*args, **kwargs)
        try:
            m = self.metadata
        except Document.metadata.RelatedObjectDoesNotExist:
            m = DublinCoreMetadata.objects.create(document=self)
            m.save()
        return s

    def get_absolute_url(self):
        keys = {
            "short_name": self.series.collection.owner.short_name,
            "collection_slug": self.series.collection.slug,
            "identifier": self.identifier,
        }
        return reverse("document", kwargs=keys)

    def export_pdf(self, use_image=True):
        """
        Provide a full PDF version of the document.

        use_image:
            true: generate the PDF using page images
            false: generate the PDF using just the extracted text
        """
        from biblios.services.exporters import export_pdf

        return export_pdf(self, use_image)

    def export_text(self):
        """
        Provide a text file version of the document.
        """
        from biblios.services.exporters import export_text

        return export_text(self)

    def export_xml(self):
        """
        Provides an XML file of the document's metadata.
        """
        from biblios.services.exporters import export_metadata_dc

        return export_metadata_dc(self)


# An implementation of Dublin Core metadata:
# https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
class DublinCoreMetadata(BibliosModel):
    FIELDS = (
        "title",
        "description",
        "creator",
        "subject",
        "publisher",
        "contributor",
        "date",
        "type",
        "format",
        "identifier",
        "source",
        "language",
        "relation",
        "coverage",
        "rights",
    )
    document = models.OneToOneField(
        Document, on_delete=models.CASCADE, related_name="metadata"
    )
    title = models.JSONField(blank=True, default=list)
    description = models.JSONField(blank=True, default=list)
    creator = models.JSONField(blank=True, default=list)
    subject = models.JSONField(blank=True, default=list)
    publisher = models.JSONField(blank=True, default=list)
    contributor = models.JSONField(blank=True, default=list)
    date = models.JSONField(blank=True, default=list)
    type = models.JSONField(blank=True, default=list)
    format = models.JSONField(blank=True, default=list)
    identifier = models.JSONField(blank=True, default=list)
    source = models.JSONField(blank=True, default=list)
    language = models.JSONField(blank=True, default=list)
    relation = models.JSONField(blank=True, default=list)
    coverage = models.JSONField(blank=True, default=list)
    rights = models.JSONField(blank=True, default=list)

    class Meta:
        rules_permissions = {
            "add": is_org_editor,
            "view": is_org_viewer,
            "change": is_org_editor,
            "delete": is_org_editor,
        }

    def __str__(self):
        return f"{self.document} Metadata"


class Page(BibliosModel):
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name="pages"
    )
    number = models.SmallIntegerField(default=1)
    image = models.ImageField(blank=True, upload_to="pages")
    history = HistoricalRecords()

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
        ordering = ["number"]

    def __str__(self):
        return f"{self.document} page {self.number}"

    def get_absolute_url(self):
        keys = {
            "short_name": self.document.series.collection.owner.short_name,
            "collection_slug": self.document.series.collection.slug,
            "identifier": self.document.identifier,
            "number": self.number,
        }
        return reverse("page", kwargs=keys)

    @property
    def can_extract(self):
        return (
            not self.has_extraction
            and CloudService.objects.filter(
                organization=self.document.series.collection.owner
            ).exists()
        )

    @property
    def has_extraction(self):
        return self.words.exists()

    # Hand off this work to the Huey background task
    def generate_extraction(self):
        extractor = self.document.series.collection.owner.cloudservice.extractor
        q = queue_extraction(extractor(self))
        logger.info(f"Queuing {q}")


class TextBlock(BibliosModel):
    PRINTED = "P"
    HANDWRITING = "H"
    TEXT_TYPE_CHOICES = {PRINTED: "Printed", HANDWRITING: "Handwriting"}

    INCLUDE = "I"
    MERGE = "M"
    OMIT = "O"
    PRINT_CONTROL_CHOICES = {
        INCLUDE: "Include",
        MERGE: "Merge With Prior",
        OMIT: "Omit",
    }

    # Confidence level thresholds
    CONF_ACCEPTED = 99.99
    CONF_HIGH = 90.0
    CONF_MEDIUM = 80.0
    CONF_LOW = 50.0
    CONF_NONE = 0.0

    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="words")

    # Extraction ID refers to a single element on the page that is identified as a text block.
    extraction_id = models.CharField(max_length=50, blank=True)

    text = models.CharField(max_length=255)
    text_type = models.CharField(max_length=1, choices=TEXT_TYPE_CHOICES)

    # The word's position on the page: line, and word number on that line
    line = models.IntegerField()
    number = models.IntegerField()

    confidence = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    # Controls whether this word should be included from document exports.
    # Include: a normal word to include in the exported file
    # Merge With Prior: a word fragment; don't include the text, and extend the previous word's bounding box
    # Omit: leave it out completely
    print_control = models.CharField(
        max_length=1, choices=PRINT_CONTROL_CHOICES, default=INCLUDE
    )

    # The bounding box is recorded as the top-left corner (X,Y 0) and bottom-right corner (X,Y 1)
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

    suggestions = models.JSONField(blank=True, default=dict)
    history = HistoricalRecords()

    class Meta:
        rules_permissions = {
            "add": is_org_editor,
            "view": is_org_viewer,
            "change": is_org_editor,
            "delete": is_org_editor,
        }
        ordering = ["line", "number"]

    def __str__(self):
        return self.text

    def __get_suggestions__(self):
        """Get spellcheck suggestions for the word, including any special checks like long-s detection."""
        from biblios.services.suggestions import generate_suggestions

        return generate_suggestions(self.text, self.page.document.use_long_s_detection)

    def save(self, **kwargs):
        """Generate spellcheck suggestions on save"""
        self.suggestions = self.__get_suggestions__()
        # In case the word text has been specified as an update_field, include the suggestions too
        if (
            update_fields := kwargs.get("update_fields")
        ) is not None and "text" in update_fields:
            kwargs["update_fields"] = {"suggestions"}.union(update_fields)
        super().save(**kwargs)

    @property
    def confidence_level(self):
        """Provides a scale rating of the word's confidence level"""
        if self.confidence >= TextBlock.CONF_ACCEPTED:
            return "accepted"
        elif self.confidence >= TextBlock.CONF_HIGH:
            return "high"
        elif self.confidence >= TextBlock.CONF_MEDIUM:
            return "medium"
        elif self.confidence >= TextBlock.CONF_LOW:
            return "low"
        else:
            return "none"


class UserRole(models.Model):
    EDITOR = "E"
    ARCHIVIST = "A"
    GUEST = "G"

    ROLE_CHOICES = {EDITOR: "Editor", ARCHIVIST: "Archivist", GUEST: "Guest"}

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=1, choices=ROLE_CHOICES)
    history = HistoricalRecords()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "organization", "role"], name="unique_roles"
            )
        ]

    def __str__(self):
        return f"{self.organization} {UserRole.ROLE_CHOICES[self.role]}"

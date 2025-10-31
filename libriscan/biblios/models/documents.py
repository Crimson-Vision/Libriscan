import logging


from huey.contrib.djhuey import HUEY as huey

from django.db import models
from django.urls import reverse
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.functional import cached_property


from simple_history.models import HistoricalRecords

from biblios.access_rules import is_org_editor, is_org_viewer
from biblios.models.base import BibliosModel
from biblios.tasks import queue_extraction

logger = logging.getLogger("django")


class Document(BibliosModel):
    NEW = "N"
    IN_PROGRESS = "I"
    REVIEW = "R"
    APPROVED = "A"
    STATUS_CHOICES = {
        NEW: "New",
        IN_PROGRESS: "In Progress",
        REVIEW: "Ready for Review",
        APPROVED: "Approved",
    }
    collection = models.ForeignKey(
        "biblios.Collection", on_delete=models.CASCADE, related_name="documents"
    )
    series = models.ForeignKey(
        "biblios.Series",
        on_delete=models.CASCADE,
        related_name="documents",
        blank=True,
        null=True,
    )
    identifier = models.SlugField(max_length=25)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default=NEW)
    published_url = models.URLField(blank=True)
    history = HistoricalRecords()

    # Spelling suggestion rules
    use_long_s_detection = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["collection", "identifier"], name="unique_doc_per_org"
            )
        ]
        rules_permissions = {
            "add": is_org_editor,
            "view": is_org_viewer,
            "change": is_org_editor,
            "delete": is_org_editor,
        }

    @property
    def can_export(self):
        """Checks if the document has at least one page with extracted text."""
        return TextBlock.objects.filter(
            page__document=self, print_control=TextBlock.INCLUDE
        ).exists()

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
            "short_name": self.collection.owner.short_name,
            "collection_slug": self.collection.slug,
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
        from biblios.models.organizations import CloudService
        return (
            not self.has_extraction
            and CloudService.objects.filter(
                organization=self.document.series.collection.owner
            ).exists()
            and huey.get(self.extraction_key, peek=True) is None
        )

    @property
    def has_extraction(self):
        return self.words.exists()

    @cached_property
    def extraction_key(self):
        return f"extracting-{self.id}"

    # Hand off this work to the Huey background task
    def generate_extraction(self):
        extractor = self.document.series.collection.owner.cloudservice.extractor
        q = queue_extraction(extractor(self))
        logger.info(f"Queuing {q.id}")


class TextBlock(BibliosModel):
    PRINTED = "P"
    HANDWRITING = "H"
    TEXT_TYPE_CHOICES = {PRINTED: "Printed", HANDWRITING: "Handwriting"}

    INCLUDE = "I"
    MERGE = "M"
    OMIT = "O"
    PRINT_CONTROL_CHOICES = {
        INCLUDE: "Include",
        MERGE: "Merged",
        OMIT: "Omit",
    }

    # Confidence level thresholds
    CONF_ACCEPTED = 99.999
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
        validators=[MinValueValidator(0), MaxValueValidator(CONF_ACCEPTED)],
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

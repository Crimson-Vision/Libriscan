import logging

import rules
from django.core.exceptions import ValidationError
from django.db import models
from django.urls import reverse
from django.utils.functional import cached_property
from localflavor.us.models import USStateField
from localflavor.us.us_states import STATE_CHOICES
from simple_history.models import HistoricalRecords

from biblios.access_rules import is_org_archivist, is_org_editor, is_org_viewer
from biblios.models.base import BibliosModel

logger = logging.getLogger("django")


# This model is what we'll use for libraries, but calling it Org for two reasons:
# Trying to avoid ambiguity with software libraries, and maybe non-library orgs could use this someday
class Organization(BibliosModel):
    name = models.CharField(max_length=75)
    short_name = models.SlugField(max_length=10)
    city = models.CharField(max_length=25)
    state = USStateField(choices=STATE_CHOICES)
    primary = models.BooleanField(default=False)
    contact = models.EmailField(blank=True, null=True)
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
        from biblios.services.extractors import EXTRACTORS

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
        # Override needed for the /admin menu
        # to avoid having Seriess (with 2 ss)
        verbose_name_plural = "Series"

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

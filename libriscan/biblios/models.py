from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator

from localflavor.us.us_states import STATE_CHOICES
from localflavor.us.models import USStateField

class User(AbstractUser):
    pass


# This model is what we'll use for libraries, but calling it Org for two reasons:
# Trying to avoid ambiguity with software libraries, and maybe non-library orgs could use this someday
class Organization(models.Model):
    name = models.CharField(max_length=75)
    short_name = models.CharField(max_length=5)
    city = models.CharField(max_length=25)
    state = USStateField(choices=STATE_CHOICES)

    def __str__(self):
        return self.name
    

class Consortium(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name
    

# Using a through model for consortium membership, since there's probably additional info useful for us to track
class Membership(models.Model):
    pk = models.CompositePrimaryKey("organization_id", "consortium_id")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    consortium = models.ForeignKey(Consortium, on_delete=models.CASCADE)


class Collection(models.Model):
    owner = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name
    

class Series(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name
    

class Document(models.Model):
    series = models.ForeignKey(Series, on_delete=models.CASCADE)
    identifier = models.CharField(max_length=25)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["identifier"], name="unique_doc_per_org")]

    def __str__(self):
        return self.identifier
    

class Page(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    number = models.SmallIntegerField(default=1)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["document", "number"], name="unique_page")]

    def __str__(self):
        return f"{self.document} page {self.number}"
    

class TextBlock(models.Model):
    PRINTED = 'P'
    HANDWRITING = 'H'
    TEXT_TYPE_CHOICES = {
        PRINTED: "Printed",
        HANDWRITING: "Handwriting"
    }

    page = models.ForeignKey(Page, on_delete=models.CASCADE)

    # Extraction ID refers to a single element on the page that is identified as a text block.
    extraction_id = models.CharField(max_length=50, blank=True)

    # As the text contained in the text block changes, the sequence increments to track a version history
    sequence = models.SmallIntegerField(default=1)

    text = models.CharField(max_length=255)
    text_type = models.CharField(max_length=1, choices=TEXT_TYPE_CHOICES)
    confidence = models.DecimalField(max_digits=5, decimal_places=3, validators=[MinValueValidator(0), MaxValueValidator(100)])

    # The bounding box is recorded as the bottom-left corner (X,Y 0) and top-right corner (X,Y 1)
    # Textract returns values that are percentages of the page width, so these need to be decimals too
    geo_x_0 = models.DecimalField(max_digits=20, decimal_places=20, validators=[MinValueValidator(0), MaxValueValidator(1)])
    geo_y_0 = models.DecimalField(max_digits=20, decimal_places=20, validators=[MinValueValidator(0), MaxValueValidator(1)])
    geo_x_1 = models.DecimalField(max_digits=20, decimal_places=20, validators=[MinValueValidator(0), MaxValueValidator(1)])
    geo_y_1 = models.DecimalField(max_digits=20, decimal_places=20, validators=[MinValueValidator(0), MaxValueValidator(1)])

    class Meta:
        constraints = [models.UniqueConstraint(fields=["page", "extraction_id", "sequence"], name="unique_textblock_sequence")]

    def __str__(self):
        return self.text
    

class UserRole(models.Model):
    EDITOR = 'E'
    STAFF = 'S'
    ADMIN = 'A'
    GUEST = 'G'

    ROLE_CHOICES = {
        EDITOR: "Editor",
        STAFF: "Staff",
        ADMIN: "Administrator",
        GUEST: "Guest"
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=1, choices=ROLE_CHOICES)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization", "role"], name="unique_roles")]

    def __str__(self):
        return f"{self.organization} {UserRole.ROLE_CHOICES[self.role]}"
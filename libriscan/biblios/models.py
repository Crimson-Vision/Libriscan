from django.db import models
from django.contrib.auth.models import AbstractUser

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
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    consortium = models.ForeignKey(Consortium, on_delete=models.CASCADE)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "consortium"], name="unique_consortium_membership"
            )
        ]
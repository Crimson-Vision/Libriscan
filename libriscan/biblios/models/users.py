import logging

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


from simple_history.models import HistoricalRecords

from biblios.managers import CustomUserManager

logger = logging.getLogger("django")


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


class UserRole(models.Model):
    EDITOR = "E"
    ARCHIVIST = "A"
    GUEST = "G"

    ROLE_CHOICES = {EDITOR: "Editor", ARCHIVIST: "Archivist", GUEST: "Guest"}

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey("biblios.Organization", on_delete=models.CASCADE)
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

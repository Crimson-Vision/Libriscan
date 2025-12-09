import logging

from django import forms
from django.conf import settings
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from biblios.models import User, Collection, Series, Document, Page

logger = logging.getLogger("django")


# Custom user forms from https://testdriven.io/blog/django-custom-user-model/
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email",)


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ("email",)


class CollectionForm(forms.ModelForm):
    class Meta:
        model = Collection
        fields = ("owner", "name", "slug")


class SeriesForm(forms.ModelForm):
    class Meta:
        model = Series
        fields = ("collection", "name", "slug")


class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ("collection", "series", "identifier", "use_long_s_detection")


class PageForm(forms.ModelForm):
    class Meta:
        model = Page
        fields = ("document", "number", "image", "identifier")
    
    def clean_identifier(self):
        identifier = self.cleaned_data.get("identifier")
        if identifier and not identifier.isalnum():
            raise forms.ValidationError("Identifier must contain only alphanumeric characters.")
        return identifier

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
        fields = ("document", "number", "image")


class FilePondUploadForm(forms.Form):
    image = forms.ImageField()

    def clean_image(self):
        image = self.cleaned_data.get("image")
        if not image:
            raise forms.ValidationError("No file was submitted.")

        # Check file type
        if image.content_type not in getattr(settings, "ALLOWED_UPLOAD_TYPES", []):
            raise forms.ValidationError(
                "Invalid file type. Please upload TIFF, JPEG, or PNG files only."
            )

        # Check file size
        max_size = getattr(settings, "MAX_UPLOAD_SIZE", 5 * 1024 * 1024)
        if image.size > max_size:
            raise forms.ValidationError(
                "File size exceeds limit. Please upload a smaller file."
            )

        return image

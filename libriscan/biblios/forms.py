from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from biblios.models import User, Document, Page


# Custom user forms from https://testdriven.io/blog/django-custom-user-model/
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email",)


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ("email",)


class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ("series", "identifier", "use_long_s_detection")


class PageForm(forms.ModelForm):
    class Meta:
        model = Page
        fields = ("document", "number", "image")

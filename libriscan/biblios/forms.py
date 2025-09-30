from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from biblios.models import User, Document


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
        fields = "__all__"

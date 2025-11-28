from django.http import HttpResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404

from biblios.models import Page


def image_auth(request, image):
    image_path = f"pages/{image}"
    page = get_object_or_404(Page, image=image_path)
    if request.user.userrole_set.filter(organization=page.document.collection.owner):
        return HttpResponse()
    else:
        return HttpResponseForbidden()

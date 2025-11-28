from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect
from django.http import Http404

from biblios.models import Page


def image_auth(request, image):
    image_path = f"pages/{image}"
    page = get_object_or_404(Page, image=image_path)
    if request.user.userrole_set.filter(organization=page.document.collection.owner):
        try:
            p = (
                request.headers["X-Forwarded-Proto"]
                + request.headers["X-Forwarded-Host"]
                + request.headers["X-Forwarded-Uri"]
            )
            return redirect(p)
        except KeyError:
            raise Http404()

    else:
        return HttpResponseForbidden()

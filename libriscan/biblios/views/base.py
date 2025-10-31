import logging

from django.conf import settings
from django.shortcuts import render

from rules.contrib.views import AutoPermissionRequiredMixin

from biblios.models import Organization, Document

logger = logging.getLogger("django")


# Most permissions in this app depend on Organization. This mixin overrides get_permission_object
# so various class-based views will automatically check perms against their owner org instead of
# their own model instance.
# Safe to use in any view that lives under an org-based URL.
# Strictly speaking this belongs in access_rules.py, but it causes a circular import with models.py
class OrgPermissionRequiredMixin(AutoPermissionRequiredMixin):
    def get_permission_object(self):
        return Organization.objects.get(short_name=self.kwargs.get("short_name"))


# This is a verbose way of handling RBAC on a collections page
# The permission_required handle on collection_detail calls this function,
# and passes it the same params.
# It takes the object returned here, then checks if the request.user has
# the permission 'biblios.view_organization' on it.
# If so, they can access this page. If not, they get a 403.
def get_org_by_collection(request, short_name, collection_slug):
    return Organization.objects.get(short_name=short_name)


def get_org_by_page(request, short_name, collection_slug, identifier, number):
    return Organization.objects.get(short_name=short_name)


def get_org_by_word(request, short_name, collection_slug, identifier, number, word_id):
    return Organization.objects.get(short_name=short_name)


def index(request):
    context = {"app_name": "Libriscan"}
    if request.user.is_authenticated:
        # The most recent doc the user edited
        recent = Document.history.filter(history_user=request.user)

        context["latest_doc"] = recent.latest() if recent.exists() else None
        # All docs in all orgs the user is a member of
        context["documents"] = Document.objects.filter(
            collection__owner__in=request.user.userrole_set.values_list(
                "organization", flat=True
            )
        )
    return render(request, "biblios/index.html", context)


def scan(request):
    context = {
        "allowed_upload_types": settings.ALLOWED_UPLOAD_TYPES,
        "max_upload_size": settings.MAX_UPLOAD_SIZE,
    }
    return render(request, "biblios/scan.html", context)

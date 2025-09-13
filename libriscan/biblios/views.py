import logging

from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView

from rules.contrib.views import AutoPermissionRequiredMixin, permission_required

from .models import Organization, Consortium, Document, Collection

logger = logging.getLogger(__name__)


def index(request):
    orgs = Organization.objects.all()
    context = {"app_name": "Libriscan", "orgs": orgs}
    return render(request, "biblios/index.html", context)


# Sample page view for Tailwind + daisyUI + HTMX
def sample(request):
    return render(request, "biblios/sample.html")


def organization_list(request):
    orgs = request.user.userrole_set.all()
    context = {"orgs": orgs}
    return render(request, "biblios/organization_list.html", context)


class OrganizationDetail(AutoPermissionRequiredMixin, DetailView):
    model = Organization
    context_object_name = "org"
    slug_field = "short_name"
    slug_url_kwarg = "short_name"


class ConsortiumDetail(AutoPermissionRequiredMixin, DetailView):
    model = Consortium
    context_object_name = "consortium"


class DocumentList(AutoPermissionRequiredMixin, ListView):
    model = Document


def get_org_by_collection(request, short_name, pk):
    return Organization.objects.get(short_name=short_name)


@permission_required("organizations.view_organization", fn=get_org_by_collection)
def collection_detail(request, short_name, collection_id):
    collection = get_object_or_404(Collection, collection_id)
    context = {"collection": collection}
    render(request, "biblios/collection_detail.html", context)

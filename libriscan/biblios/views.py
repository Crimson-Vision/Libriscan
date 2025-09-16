import logging

from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView

from rules.contrib.views import AutoPermissionRequiredMixin, permission_required

from .models import Organization, Consortium, Document, Collection, Page

logger = logging.getLogger(__name__)


def index(request):
    orgs = Organization.objects.all()
    context = {"app_name": "Libriscan", "orgs": orgs}
    return render(request, "biblios/index.html", context)


# Sample page view for Tailwind + daisyUI + HTMX
def sample(request):
    return render(request, "biblios/sample.html")


# This is a basic way of handling RBAC on the user's org list.
# Rules don't come into play at all. The view just only queries
# for orgs the user is a member of, which by our rules happens
# to be the ones they have permission to see.
def organization_list(request):
    orgs = request.user.userrole_set.all()
    context = {"orgs": orgs}
    return render(request, "biblios/organization_list.html", context)


# This is the easy way to handle RBAC. All the models have permissions
# specified in models.py. This AutoPermissionRequiredMixin figures
# out how to check them for each request user.
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


# This is a verbose way of handling RBAC on a collections page
# The permission_required handle on collection_detail calls this function,
# and passes it the same params.
# It takes the object returned here, then checks if the request.user has
# the permission 'biblios.view_organization' on it.
# If so, they can access this page. If not, they get a 403.
def get_org_by_collection(request, short_name, pk):
    return Organization.objects.get(short_name=short_name)


@permission_required(
    "biblios.view_organization", fn=get_org_by_collection, raise_exception=True
)
def collection_detail(request, short_name, pk):
    collection = Collection.objects.get(pk=pk)
    context = {"collection": collection}
    return render(request, "biblios/collection_detail.html", context)



def extract_test(request, short_name):
    org = Organization.objects.select_related('cloudservice').get(short_name=short_name)
    doc = Document.objects.filter(series__collection__owner=org).first()

    context = {'org':org, 'doc':doc}
    return render(request, "biblios/page.html", context)
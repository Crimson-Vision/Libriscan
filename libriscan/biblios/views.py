import logging

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.generic import ListView, DetailView
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required


from rules.contrib.views import AutoPermissionRequiredMixin, permission_required

from .models import Organization, Consortium, Document, Collection, Page

logger = logging.getLogger(__name__)


def index(request):
    orgs = Organization.objects.all()
    context = {"app_name": "Libriscan", "orgs": orgs}
    return render(request, "biblios/index.html", context)


@login_required
def scan(request):
    return render(request, "biblios/scan.html")


# This is a basic way of handling RBAC on the user's org list.
# Rules don't come into play at all. The view just only queries
# for orgs the user is a member of, which by our rules happens
# to be the ones they have permission to see.
def organization_list(request):
    if request.user.is_authenticated:
        orgs = request.user.userrole_set.all()
    else:
        orgs = []
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


class DocumentDetail(AutoPermissionRequiredMixin, DetailView):
    model = Document


class PageDetail(DetailView):
    model = Page
    template_name = "biblios/page.html"


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


@require_http_methods(["POST"])
def extract_test(request, pk):
    # org = Organization.objects.select_related('cloudservice').get(short_name=short_name)
    # doc = Document.objects.filter(series__collection__owner=org).first()
    page = Page.objects.select_related("document__series__collection__owner").get(id=pk)
    org = page.document.series.collection.owner

    extractor = org.cloudservice.get_extractor(page)

    context = {"words": extractor.get_words()}

    return render(request, "biblios/words.html", context)


def export_pdf(request, pk, use_image=True):
    """
    Generates a PDF of a given doc ID.
    use_image:
        True: generate the PDF using page images
        False: generate the PDF using just the extracted text
    """
    doc = Document.objects.get(pk=pk)
    return doc.export_pdf(use_image)


def export_text(request, pk):
    """
    Generates a text file of a given doc ID.
    """
    doc = Document.objects.get(pk=pk)
    return doc.export_text()


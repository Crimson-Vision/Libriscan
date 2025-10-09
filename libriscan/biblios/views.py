import logging
import os
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_not_required
from django.urls import reverse_lazy

from rules.contrib.views import AutoPermissionRequiredMixin, permission_required

from .models import Organization, Consortium, Document, Collection, Series, Page
from .forms import FilePondUploadForm

logger = logging.getLogger(__name__)


# Most permissions in this app depend on Organization. This mixin overrides get_permission_object
# so various class-based views will automatically check perms against their owner org instead of
# their own model instance.
# Safe to use in any view that lives under an org-based URL.
# Strictly speaking this belongs in access_rules.py, but it causes a circular import with models.py
class OrgPermissionRequiredMixin(AutoPermissionRequiredMixin):
    def get_permission_object(self):
        return Organization.objects.get(short_name=self.kwargs.get("short_name"))


def index(request):
    orgs = Organization.objects.all()
    context = {"app_name": "Libriscan", "orgs": orgs}
    return render(request, "biblios/index.html", context)


def scan(request):
    context = {
        "allowed_upload_types": settings.ALLOWED_UPLOAD_TYPES,
        "max_upload_size": settings.MAX_UPLOAD_SIZE,
    }
    return render(request, "biblios/scan.html", context)


class ConsortiumDetail(AutoPermissionRequiredMixin, DetailView):
    model = Consortium
    context_object_name = "consortium"


# This is a basic way of handling RBAC on the user's org list.
# Rules don't come into play at all. The view just only queries
# for orgs the user is a member of, which by our rules happens
# to be the ones they have permission to see.
def organization_list(request):
    if request.user.is_authenticated:
        # This ignores the superuser flag
        orgs = request.user.userrole_set.all()
    else:
        orgs = []
    context = {"orgs": orgs}
    return render(request, "biblios/organization_list.html", context)


# This is the easy way to handle RBAC. All the models have permissions
# specified in models.py. This AutoPermissionRequiredMixin figures
# out how to check them for each request user.
# But note that any class views below the Org need to have get_permission_object overridden.
class OrganizationDetail(OrgPermissionRequiredMixin, DetailView):
    model = Organization
    context_object_name = "org"
    slug_field = "short_name"
    slug_url_kwarg = "short_name"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        role = None
        if self.request.user.is_authenticated:
            role = self.request.user.userrole_set.filter(
                organization=self.object
            ).first()
        context["user_role"] = role.get_role_display() if role else None
        return context


# This is a verbose way of handling RBAC on a collections page
# The permission_required handle on collection_detail calls this function,
# and passes it the same params.
# It takes the object returned here, then checks if the request.user has
# the permission 'biblios.view_organization' on it.
# If so, they can access this page. If not, they get a 403.
def get_org_by_collection(request, short_name, collection_slug):
    return Organization.objects.get(short_name=short_name)


@permission_required(
    "biblios.view_organization", fn=get_org_by_collection, raise_exception=True
)
def collection_detail(request, short_name, collection_slug):
    collection = Collection.objects.get(slug=collection_slug)
    context = {"collection": collection}
    return render(request, "biblios/collection_detail.html", context)


class SeriesDetail(OrgPermissionRequiredMixin, DetailView):
    model = Series
    context_object_name = "series"
    slug_url_kwarg = "series_slug"


class DocumentList(OrgPermissionRequiredMixin, ListView):
    model = Document


class DocumentDetail(OrgPermissionRequiredMixin, DetailView):
    model = Document
    slug_field = "identifier"
    slug_url_kwarg = "identifier"

    def get_context_data(self, **kwargs):
        # Insert some of the URL parameters into the context
        # Probably something does this out of the box...
        context = super().get_context_data(**kwargs)
        context["keys"] = {
            "owner": self.kwargs.get("short_name"),
            "collection_slug": self.kwargs.get("collection_slug"),
        }
        return context


class DocumentCreateView(OrgPermissionRequiredMixin, CreateView):
    model = Document
    fields = ["series", "identifier", "use_long_s_detection"]


class DocumentUpdateView(OrgPermissionRequiredMixin, UpdateView):
    model = Document


class DocumentDeleteView(OrgPermissionRequiredMixin, DeleteView):
    model = Document
    success_url = reverse_lazy("index")


class PageCreateView(OrgPermissionRequiredMixin, CreateView):
    model = Page
    fields = ("number", "image")

    def get_initial(self, **kwargs):
        """Dynamically construct initial values for some fields"""
        from django.db.models import Max

        initial = super().get_initial(**kwargs)
        doc = Document.objects.get(identifier=self.kwargs.get("identifier"))
        number = doc.pages.aggregate(Max("number", default=0))

        initial["number"] = number["number__max"] + 1

        return initial

    def post(self, request, **kwargs):
        from biblios.forms import PageForm

        self.object = None

        # Create a mutable copy of the POST object and add the parent Document to it
        # Users shouldn't set this directly in the form -- it's based on the doc they're working from
        post = request.POST.copy()
        post.update(
            {"document": Document.objects.get(identifier=self.kwargs.get("identifier"))}
        )

        # Bind the image file to the form data when we instatiate it
        form = PageForm(post, request.FILES)

        return self.form_valid(form) if form.is_valid() else self.form_invalid(form)


@require_http_methods(["POST"])
def handle_upload(request):
    """Handle file uploads from FilePond."""
    form = FilePondUploadForm(request.POST, request.FILES)

    if not form.is_valid():
        error_msg = form.errors.get("image", ["Upload failed."])[0]
        return HttpResponse(error_msg, status=400)

    try:
        upload_file = form.cleaned_data["image"]
        file_path = os.path.join("uploads", upload_file.name)
        saved_path = default_storage.save(file_path, ContentFile(upload_file.read()))

        # Store file info in session
        request.session["filepond_last_upload"] = {
            "path": saved_path,
            "name": upload_file.name,
            "size": upload_file.size,
        }

        return HttpResponse(saved_path)

    except OSError as e:
        logger.error("File upload error: %s", e)
        return HttpResponse("An error occurred while processing your file.", status=500)


class PageDetail(OrgPermissionRequiredMixin, DetailView):
    model = Page
    template_name = "biblios/page.html"
    context_name = "pages"

    def get_context_data(self, **kwargs):
        # Insert some of the URL parameters into the context
        # Probably something does this out of the box...
        context = super().get_context_data(**kwargs)
        owner = self.kwargs.get("short_name")
        collection = self.kwargs.get("collection_slug")
        doc = self.kwargs.get("identifier")
        context["keys"] = {"owner": owner, "collection_slug": collection, "doc": doc}
        return context

    def get_object(self, **kwargs):
        # The org owner and collection are part of the URL, so make sure the request is for a valid combo
        # Obviously, a URL of 'page/<int:pk>' would be more efficient, but gives the user less context
        owner = self.kwargs.get("short_name")
        collection = self.kwargs.get("collection_slug")
        doc = self.kwargs.get("identifier")
        number = self.kwargs.get("number")
        return self.get_queryset().get(
            document__series__collection__owner__short_name=owner,
            document__series__collection__slug=collection,
            document__identifier=doc,
            number=number,
        )


@require_http_methods(["POST"])
def extract_text(request, short_name, collection_slug, identifier, number):
    page = Page.objects.select_related("document__series__collection__owner").get(
        document__series__collection__owner__short_name=short_name,
        document__series__collection__slug=collection_slug,
        document__identifier=identifier,
        number=number,
    )
    org = page.document.series.collection.owner

    extractor = org.cloudservice.get_extractor(page)

    context = {"words": extractor.get_words()}

    return render(request, "biblios/components/forms/text_display.html", context)


def export_pdf(request, short_name, collection_slug, identifier, use_image=True):
    """
    Generates a PDF of a given doc ID.
    use_image:
        True: generate the PDF using page images
        False: generate the PDF using just the extracted text
    """
    doc = Document.objects.get(
        series__collection__owner__short_name=short_name,
        series__collection__slug=collection_slug,
        identifier=identifier,
    )
    return doc.export_pdf(use_image)


def export_text(request, short_name, collection_slug, identifier):
    """
    Generates a text file of a given doc ID.
    """
    doc = Document.objects.get(
        series__collection__owner__short_name=short_name,
        series__collection__slug=collection_slug,
        identifier=identifier,
    )
    return doc.export_text()

import logging
import os
from datetime import datetime, timedelta

from django import forms
from django.conf import settings
from django.http import HttpResponse, Http404, JsonResponse
from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse

from huey.contrib.djhuey import HUEY as huey

from rules.contrib.views import permission_required

from biblios.models import Document, Collection, Page, DublinCoreMetadata, TextBlock

from biblios.forms import DocumentForm, FilePondUploadForm
from .base import OrgPermissionRequiredMixin, get_org_by_page, get_org_by_document

logger = logging.getLogger("django")


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
    form_class = DocumentForm

    def get_form(self, *args, **kwargs):
        form = super().get_form(*args, **kwargs)

        # Get the current collection from URL
        collection = Collection.objects.get(
            owner__short_name=self.kwargs.get("short_name"),
            slug=self.kwargs.get("collection_slug"),
        )
        
        # Pre-populate collection field
        form.initial["collection"] = collection.id
        
        # Filter collection queryset to only show current collection
        form.fields["collection"].queryset = Collection.objects.filter(id=collection.id)

        # Update the Series field so it only shows values owned by the current Collection
        form.fields["series"].queryset = form.fields["series"].queryset.filter(
            collection=collection
        )

        return form

    def post(self, request, **kwargs):
        self.object = None

        # Create a mutable copy of the POST object and add the parent Collection to it
        # Users shouldn't set this directly in the form -- it's based on the collection they're working from
        post = request.POST.copy()
        post.update(
            {
                "collection": Collection.objects.get(
                    owner__short_name=self.kwargs.get("short_name"),
                    slug=self.kwargs.get("collection_slug"),
                )
            }
        )

        # Bind the form data when we instantiate it
        form = DocumentForm(post)

        return self.form_valid(form) if form.is_valid() else self.form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        collection = Collection.objects.get(
            owner__short_name=self.kwargs.get("short_name"),
            slug=self.kwargs.get("collection_slug"),
        )
        context["collection"] = collection
        return context


class DocumentUpdateView(OrgPermissionRequiredMixin, UpdateView):
    model = Document
    form_class = DocumentForm
    slug_field = "identifier"
    slug_url_kwarg = "identifier"
    template_name = "biblios/document_form.html"

    def _get_collection(self):
        """Helper to get the current collection."""
        return Collection.objects.get(
            owner__short_name=self.kwargs.get("short_name"),
            slug=self.kwargs.get("collection_slug"),
        )

    def get_form(self, *args, **kwargs):
        form = super().get_form(*args, **kwargs)
        collection = self._get_collection()
        form.fields["series"].queryset = form.fields["series"].queryset.filter(collection=collection)
        form.fields["collection"].widget = forms.HiddenInput()
        return form

    def form_valid(self, form):
        """Ensure collection is set correctly before saving."""
        form.instance.collection = self._get_collection()
        return super().form_valid(form)

    def get_success_url(self):
        return reverse("document", kwargs={
            "short_name": self.kwargs.get("short_name"),
            "collection_slug": self.kwargs.get("collection_slug"),
            "identifier": self.object.identifier,
        })


class DocumentDeleteView(OrgPermissionRequiredMixin, DeleteView):
    model = Document
    slug_field = "identifier"
    slug_url_kwarg = "identifier"
    template_name = "biblios/document_confirm_delete.html"

    def get_object(self, queryset=None):
        """Get document by URL parameters."""
        return get_object_or_404(
            Document,
            collection__owner__short_name=self.kwargs.get("short_name"),
            collection__slug=self.kwargs.get("collection_slug"),
            identifier=self.kwargs.get("identifier"),
        )

    def get_success_url(self):
        """Redirect to collection page after deletion."""
        return reverse("collection", kwargs={
            "short_name": self.kwargs.get("short_name"),
            "collection_slug": self.kwargs.get("collection_slug"),
        })


class MetadataDetail(OrgPermissionRequiredMixin, DetailView):
    model = DublinCoreMetadata
    template_name = "biblios/metadata_detail.html"
    context_object_name = "metadata"

    def get_object(self, queryset=None):
        # The org owner and collection are part of the URL, so make sure the request is for a valid combo
        owner = self.kwargs.get("short_name")
        collection = self.kwargs.get("collection_slug")
        identifier = self.kwargs.get("identifier")

        try:
            doc = Document.objects.get(
                collection__owner__short_name=owner,
                collection__slug=collection,
                identifier=identifier,
            )
            return doc.metadata
        except Document.metadata.RelatedObjectDoesNotExist:
            return Http404("No such document metadata found")


class MetadataUpdateView(OrgPermissionRequiredMixin, UpdateView):
    model = DublinCoreMetadata
    template_name = "biblios/metadata_update.html"
    context_object_name = "metadata"

    def get_object(self, queryset=None):
        # The org owner and collection are part of the URL, so make sure the request is for a valid combo
        owner = self.kwargs.get("short_name")
        collection = self.kwargs.get("collection_slug")
        identifier = self.kwargs.get("identifier")

        try:
            doc = Document.objects.get(
                collection__owner__short_name=owner,
                collection__slug=collection,
                identifier=identifier,
            )
            return doc.metadata
        except Document.metadata.RelatedObjectDoesNotExist:
            return Http404("No such document metadata found")


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

    def get_context_data(self, **kwargs):
        """Add upload settings to template context"""
        import json

        context = super().get_context_data(**kwargs)
        context["allowed_upload_types"] = json.dumps(settings.ALLOWED_UPLOAD_TYPES)
        context["max_upload_size"] = settings.MAX_UPLOAD_SIZE
        return context

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

    def get_queryset(self):
        return super().get_queryset().select_related("document")

    def get_context_data(self, **kwargs):
        # Insert some of the URL parameters into the context
        # Probably something does this out of the box...
        context = super().get_context_data(**kwargs)
        owner = self.kwargs.get("short_name")
        collection = self.kwargs.get("collection_slug")
        doc = self.kwargs.get("identifier")
        context["keys"] = {"owner": owner, "collection_slug": collection, "doc": doc}

        # Add pagination context
        page = self.object
        current_number = page.number

        # Get all page numbers for dropdown
        all_page_numbers = list(page.document.pages.values_list("number", flat=True))

        # Get prev/next page numbers
        current_index = all_page_numbers.index(current_number)
        prev_page = all_page_numbers[current_index - 1] if current_index > 0 else None
        next_page = (
            all_page_numbers[current_index + 1]
            if current_index < len(all_page_numbers) - 1
            else None
        )

        context["all_pages"] = all_page_numbers
        context["prev_page"] = prev_page
        context["next_page"] = next_page

        # Get page extraction status
        context["extracting"] = huey.get(page.extraction_key, peek=True)

        # Find last edited word on this page for auto-focus
        from django.db.models import Subquery, OuterRef

        last_edited = (
            page.words.annotate(
                last_edit=Subquery(
                    TextBlock.history.filter(id=OuterRef("id"))  # pylint: disable=no-member
                    .order_by("-history_date")
                    .values("history_date")[:1]
                )
            )
            .order_by("-last_edit")
            .first()
            if page.words.exists()
            else None
        )

        context["last_edited_word_id"] = last_edited.id if last_edited else None

        return context

    def get_object(self, **kwargs):
        # The org owner and collection are part of the URL, so make sure the request is for a valid combo
        # Obviously, a URL of 'page/<int:pk>' would be more efficient, but gives the user less context
        owner = self.kwargs.get("short_name")
        collection = self.kwargs.get("collection_slug")
        doc = self.kwargs.get("identifier")
        number = self.kwargs.get("number")
        return self.get_queryset().get(
            document__collection__owner__short_name=owner,
            document__collection__slug=collection,
            document__identifier=doc,
            number=number,
        )


@permission_required("biblios.delete_page", fn=get_org_by_page, raise_exception=True)
@require_http_methods(["POST"])
def delete_page(request, short_name, collection_slug, identifier, number):
    """Delete a page and redirect back to document detail."""
    page = get_object_or_404(
        Page,
        document__collection__owner__short_name=short_name,
        document__collection__slug=collection_slug,
        document__identifier=identifier,
        number=number,
    )
    page.delete()
    return redirect(
        "document",
        short_name=short_name,
        collection_slug=collection_slug,
        identifier=identifier,
    )


@require_http_methods(["POST"])
def extract_text(request, short_name, collection_slug, identifier, number):
    page = Page.objects.select_related("document__collection__owner").get(
        document__collection__owner__short_name=short_name,
        document__collection__slug=collection_slug,
        document__identifier=identifier,
        number=number,
    )

    if extract_time := huey.get(page.extraction_key, peek=True):
        if datetime.today() - extract_time > timedelta(minutes=10):
            logger.error(f"Extraction timed out for page {page.id}")
            # Remove the page handle from the Huey store
            huey.get(page.extraction_key)
        logger.info(f"Extraction already in progress for page {page.id}")
    else:
        # Put a handle for this page in the Huey store, and track the request time
        huey.put(page.extraction_key, datetime.today())

        # Start the extraction process in the background
        page.generate_extraction()

    # Prepare context with URL parameters for the loading template
    context = {
        "short_name": short_name,
        "collection_slug": collection_slug,
        "identifier": identifier,
        "number": number,
        "owner": page.document.collection.owner,
    }

    # Return the loading template immediately
    # The client will poll check_words endpoint which returns text_display.html when ready
    return render(request, "biblios/components/forms/extraction_loading.html", context)


@permission_required(
    "biblios.view_document", fn=get_org_by_document, raise_exception=True
)
def export_pdf(request, short_name, collection_slug, identifier, use_image=True):
    """
    Generates a PDF of a given doc ID.
    use_image:
        True: generate the PDF using page images
        False: generate the PDF using just the extracted text
    """
    doc = Document.objects.get(
        collection__owner__short_name=short_name,
        collection__slug=collection_slug,
        identifier=identifier,
    )
    return doc.export_pdf(use_image)


@permission_required(
    "biblios.view_document", fn=get_org_by_document, raise_exception=True
)
def export_text(request, short_name, collection_slug, identifier):
    """
    Generates a text file of a given doc ID.
    """
    doc = Document.objects.get(
        collection__owner__short_name=short_name,
        collection__slug=collection_slug,
        identifier=identifier,
    )
    return doc.export_text()


@permission_required(
    "biblios.view_document", fn=get_org_by_document, raise_exception=True
)
def export_xml(request, short_name, collection_slug, identifier):
    """
    Generates a text file of a given doc ID.
    """
    doc = Document.objects.get(
        collection__owner__short_name=short_name,
        collection__slug=collection_slug,
        identifier=identifier,
    )
    return doc.export_xml()


@permission_required("biblios.view_page", fn=get_org_by_page, raise_exception=True)
def check_words(request, short_name, collection_slug, identifier, number):
    """Respond to the textblock polling request."""
    page = get_object_or_404(
        Page,
        number=number,
        document__identifier=identifier,
        document__collection__slug=collection_slug,
        document__collection__owner__short_name=short_name,
    )

    if page.words.exists():
        # HTMX's polling trigger will stop polling when it receives status code 286
        # Take the page's extraction handle out of Huey's result store
        huey.get(page.extraction_key)
        context = {"words": page.words.all()}
        return render(
            request, "biblios/components/forms/text_display.html", context, status=286
        )
    elif huey.get(page.extraction_key, peek=True) is None:
        context = {
            "error": "Text extraction has unexpectedly stopped. See the system logs for details."
        }
        return render(
            request, "biblios/components/forms/text_display.html", context, status=286
        )
    else:
        # If the text blocks don't exist yet, return 204 No Content
        # Or whatever HTML should get swapped in while extraction is running
        return HttpResponse(status=204)

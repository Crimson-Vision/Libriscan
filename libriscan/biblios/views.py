import logging
import os
from datetime import datetime, timedelta

from django.conf import settings
from django.db import transaction
from django.http import HttpResponse, Http404, JsonResponse
from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_not_required
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy

from huey.contrib.djhuey import HUEY as huey

from rules.contrib.views import AutoPermissionRequiredMixin, permission_required

from .models import (
    Organization,
    Document,
    Collection,
    Series,
    Page,
    DublinCoreMetadata,
    TextBlock,
)
from .forms import FilePondUploadForm

logger = logging.getLogger("django")


# Most permissions in this app depend on Organization. This mixin overrides get_permission_object
# so various class-based views will automatically check perms against their owner org instead of
# their own model instance.
# Safe to use in any view that lives under an org-based URL.
# Strictly speaking this belongs in access_rules.py, but it causes a circular import with models.py
class OrgPermissionRequiredMixin(AutoPermissionRequiredMixin):
    def get_permission_object(self):
        return Organization.objects.get(short_name=self.kwargs.get("short_name"))


def index(request):
    context = {"app_name": "Libriscan"}
    if request.user.is_authenticated:
        # The most recent doc the user edited
        recent = Document.history.filter(history_user=request.user)

        context["latest_doc"] = recent.latest() if recent.exists() else None
        # All docs in all orgs the user is a member of
        context["documents"] = Document.objects.filter(
            series__collection__owner__in=request.user.userrole_set.values_list(
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
# specified in models.py. This OrgPermissionRequiredMixin figures
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


class OrganizationUpdate(OrgPermissionRequiredMixin, UpdateView):
    model = Organization
    fields = ["name", "short_name", "city", "state"]
    slug_field = "short_name"
    slug_url_kwarg = "short_name"


class CollectionCreate(OrgPermissionRequiredMixin, CreateView):
    model = Collection
    fields = ["name", "slug"]
    slug_field = "short_name"
    slug_url_kwarg = "short_name"

    def post(self, request, **kwargs):
        from biblios.forms import CollectionForm

        self.object = None

        # Create a mutable copy of the POST object and add the parent Document to it
        # Users shouldn't set this directly in the form -- it's based on the doc they're working from
        post = request.POST.copy()
        post.update(
            {
                "owner": Organization.objects.get(
                    short_name=self.kwargs.get("short_name")
                )
            }
        )

        # Bind the image file to the form data when we instatiate it
        form = CollectionForm(post)

        return self.form_valid(form) if form.is_valid() else self.form_invalid(form)


class CollectionUpdate(OrgPermissionRequiredMixin, UpdateView):
    model = Collection
    fields = ["name", "slug"]
    slug_url_kwarg = "collection_slug"


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


class SeriesCreateView(OrgPermissionRequiredMixin, CreateView):
    model = Series
    fields = ["name", "slug"]
    template_name = "biblios/series_form.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["short_name"] = self.kwargs.get("short_name")
        context["collection_slug"] = self.kwargs.get("collection_slug")
        return context

    def post(self, request, **kwargs):
        from biblios.forms import SeriesForm

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
        form = SeriesForm(post)

        return self.form_valid(form) if form.is_valid() else self.form_invalid(form)


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
                series__collection__owner__short_name=owner,
                series__collection__slug=collection,
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
                series__collection__owner__short_name=owner,
                series__collection__slug=collection,
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

    if extract_time := huey.get(page.extraction_key, peek=True):
        if datetime.today() - extract_time > timedelta(minutes=10):
            logger.error(f"Extraction timed out for page {page.id}")
            # Remove the page handle from the Huey store
            huey.get(page.extraction_key)
        logger.info(f"Extraction already in progress for page {page.id}")
    else:
        # Start the extraction process in the background
        page.generate_extraction()

    # Prepare context with URL parameters for the loading template
    context = {
        "short_name": short_name,
        "collection_slug": collection_slug,
        "identifier": identifier,
        "number": number,
        "owner": page.document.series.collection.owner,
    }

    # Return the loading template immediately
    # The client will poll check_words endpoint which returns text_display.html when ready
    return render(request, "biblios/components/forms/extraction_loading.html", context)


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


def export_xml(request, short_name, collection_slug, identifier):
    """
    Generates a text file of a given doc ID.
    """
    doc = Document.objects.get(
        series__collection__owner__short_name=short_name,
        series__collection__slug=collection_slug,
        identifier=identifier,
    )
    return doc.export_xml()


def get_org_by_page(request, short_name, collection_slug, identifier, number):
    return Organization.objects.get(short_name=short_name)


def get_org_by_word(request, short_name, collection_slug, identifier, number, word_id):
    return Organization.objects.get(short_name=short_name)


@permission_required(
    "biblios.view_organization", fn=get_org_by_page, raise_exception=True
)
def check_words(request, short_name, collection_slug, identifier, number):
    """Respond to the textblock polling request."""
    page = get_object_or_404(
        Page,
        number=number,
        document__identifier=identifier,
        document__series__collection__slug=collection_slug,
        document__series__collection__owner__short_name=short_name,
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


@permission_required(
    "biblios.change_textblock", fn=get_org_by_word, raise_exception=True
)
@require_http_methods(["POST"])
def update_word(request, short_name, collection_slug, identifier, number, word_id):
    """Update a TextBlock's text and set confidence to 99.999"""
    try:
        # Get the word with proper permissions check
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__series__collection__slug=collection_slug,
            page__document__series__collection__owner__short_name=short_name,
        )

        # Update the word text and confidence
        new_text = request.POST.get("text", "").strip()
        if new_text:
            word.text = new_text
            word.confidence = TextBlock.CONF_ACCEPTED
            word.save(update_fields=["text", "confidence"])

            return JsonResponse(
                {
                    "id": word.id,
                    "text": word.text,
                    "confidence": float(word.confidence),
                    "confidence_level": word.confidence_level,
                    "suggestions": dict(word.suggestions)
                    if isinstance(word.suggestions, list)
                    else word.suggestions,
                }
            )
        else:
            return JsonResponse({"error": "Text cannot be empty"}, status=400)

    except Exception as e:
        logger.error(f"Error updating word {word_id}: {e}")
        return JsonResponse({"error": "Failed to update word"}, status=500)


@permission_required(
    "biblios.change_textblock", fn=get_org_by_word, raise_exception=True
)
@require_http_methods(["POST", "PATCH"])
def update_print_control(
    request, short_name, collection_slug, identifier, number, word_id
):
    """Update a TextBlock's print_control field"""
    try:
        # Get the word with proper permissions check
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__series__collection__slug=collection_slug,
            page__document__series__collection__owner__short_name=short_name,
        )

        # Get the new print_control value
        print_control = request.POST.get("print_control", "").strip()

        # Validate against allowed choices
        valid_choices = [
            choice[0] for choice in TextBlock.PRINT_CONTROL_CHOICES.items()
        ]
        if print_control not in valid_choices:
            return JsonResponse(
                {
                    "error": f"Invalid print_control value. Must be one of: {', '.join(valid_choices)}"
                },
                status=400,
            )

        # Update the print_control field
        word.print_control = print_control
        word.save(update_fields=["print_control"])

        logger.info(f"Updated word {word_id} print_control to {print_control}")

        return JsonResponse(
            {
                "id": word.id,
                "text": word.text,
                "print_control": word.print_control,
                "print_control_display": TextBlock.PRINT_CONTROL_CHOICES.get(
                    word.print_control
                ),
                "confidence": float(word.confidence),
                "confidence_level": word.confidence_level,
            }
        )

    except Exception as e:
        logger.error(f"Error updating print_control for word {word_id}: {e}")
        return JsonResponse({"error": "Failed to update print control"}, status=500)


@permission_required(
    "biblios.change_textblock", fn=get_org_by_word, raise_exception=True
)
@require_http_methods(["POST", "PATCH"])
def update_text_type(request, short_name, collection_slug, identifier, number, word_id):
    """Update a TextBlock's text_type field"""
    try:
        # Get the word with proper permissions check
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__series__collection__slug=collection_slug,
            page__document__series__collection__owner__short_name=short_name,
        )

        # Get the new text_type value
        text_type = request.POST.get("text_type", "").strip()

        # Validate against allowed choices
        valid_choices = [choice[0] for choice in TextBlock.TEXT_TYPE_CHOICES.items()]
        if text_type not in valid_choices:
            return JsonResponse(
                {
                    "error": f"Invalid text_type value. Must be one of: {', '.join(valid_choices)}"
                },
                status=400,
            )

        # Update the text_type field
        word.text_type = text_type
        word.save(update_fields=["text_type"])

        logger.info(f"Updated word {word_id} text_type to {text_type}")

        return JsonResponse(
            {
                "id": word.id,
                "text": word.text,
                "text_type": word.text_type,
                "text_type_display": TextBlock.TEXT_TYPE_CHOICES.get(word.text_type),
                "confidence": float(word.confidence),
                "confidence_level": word.confidence_level,
            }
        )

    except Exception as e:
        logger.error(f"Error updating text_type for word {word_id}: {e}")
        return JsonResponse({"error": "Failed to update text type"}, status=500)


@permission_required("biblios.view_textblock", fn=get_org_by_word, raise_exception=True)
@require_http_methods(["GET"])
def textblock_history(
    request, short_name, collection_slug, identifier, number, word_id
):
    """Return the audit history of a specific TextBlock"""
    try:
        # Get the word with proper permissions check
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__series__collection__slug=collection_slug,
            page__document__series__collection__owner__short_name=short_name,
        )

        # Get all historical records for this TextBlock
        history_records = word.history.all()

        # Build response data
        history_data = []
        for record in history_records:
            # Get user role information
            user_role = None
            if record.history_user:
                # Get the user's primary role (first role found)
                role_obj = record.history_user.userrole_set.first()
                if role_obj:
                    user_role = role_obj.get_role_display()

            history_data.append(
                {
                    "history_id": record.history_id,
                    "history_date": record.history_date.isoformat(),
                    "history_type": record.get_history_type_display(),
                    "history_user": record.history_user.get_full_name()
                    or record.history_user.email
                    if record.history_user
                    else "Unknown User",
                    "history_user_role": user_role,
                    "text": record.text,
                    "confidence": float(record.confidence),
                    "text_type": record.text_type,
                    "text_type_display": TextBlock.TEXT_TYPE_CHOICES.get(
                        record.text_type
                    ),
                    "print_control": record.print_control,
                    "print_control_display": TextBlock.PRINT_CONTROL_CHOICES.get(
                        record.print_control
                    ),
                    "line": record.line,
                    "number": record.number,
                }
            )

        logger.info(f"Retrieved {len(history_data)} history records for word {word_id}")

        return JsonResponse(
            {
                "word_id": word_id,
                "current_text": word.text,
                "history_count": len(history_data),
                "history": history_data,
            }
        )

    except Exception as e:
        logger.error(f"Error retrieving history for word {word_id}: {e}")
        return JsonResponse({"error": "Failed to retrieve history"}, status=500)


@require_http_methods(["POST"])
def merge_blocks(request, short_name, collection_slug, identifier, number):
    """
    Combine two text blocks into new third text block.

    Requires two text block IDs in the request body: block1 and block2.
    """
    response = {}
    status = 400
    try:
        block1 = get_object_or_404(TextBlock, id=request.POST.get("block1", ""))
        block2 = get_object_or_404(TextBlock, id=request.POST.get("block2", ""))

        if block1.page != block2.page:
            response = {"error": "Blocks must be on the same page to be merged"}

        elif block1.line != block2.line or abs(block1.number - block2.number) != 1:
            response = {"error": "Only sequential text on the same line can be merged"}

        else:
            new_block = TextBlock()

            # Concatenate the blocks' text with no space
            new_block.text = f"{block1.text}{block2.text}"

            # Use block 1's info except where we need block 2's
            new_block.text_type = block1.text_type
            new_block.page = block1.page
            new_block.line = block1.line
            new_block.number = block1.number
            new_block.confidence = TextBlock.CONF_ACCEPTED
            # Don't assume block_1 is the first.
            # Take the smallest (x,y)0 and the largest (x,y)1 to get the full boundary corners
            new_block.geo_x_0 = min(block1.geo_x_0, block2.geo_x_0)
            new_block.geo_y_0 = min(block1.geo_y_0, block2.geo_y_0)
            new_block.geo_x_1 = max(block1.geo_x_1, block2.geo_x_1)
            new_block.geo_y_1 = max(block1.geo_x_1, block2.geo_x_1)

            with transaction.atomic():
                block1.print_control = TextBlock.MERGE
                block1.save()

                block2.print_control = TextBlock.MERGE
                block2.save()

                new_block.save()

                response = {
                    "new": {
                        "id": new_block.id,
                        "text": new_block.text,
                        "confidence": float(new_block.confidence),
                        "confidence_level": new_block.confidence_level,
                        "suggestions": dict(new_block.suggestions)
                        if isinstance(new_block.suggestions, list)
                        else new_block.suggestions,
                    },
                    "merged_1": block1.id,
                    "merged_2": block2.id,
                }
                status = 201

        return JsonResponse(response, status=status)

    except Exception as e:
        logger.error(f"Error merging text blocks: {e}")
        return JsonResponse({"error": "Failed to merge text"}, status=500)

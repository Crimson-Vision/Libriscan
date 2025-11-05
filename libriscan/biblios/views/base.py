import logging
from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q, OuterRef, Subquery
from django.core.paginator import Paginator
from django.utils.http import urlencode

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
    """
    Documents index with search, filter, sort, pagination, and view state.
    Default view: Shows last 10 documents the user recently edited
    Search: Searches ALL documents in the system
    """
    context = {"app_name": "Libriscan"}

    if not request.user.is_authenticated:
        return render(request, "biblios/index.html", context)

    # Getting the most recent item (Document or Page) the end user edited
    from biblios.models import Page

    # Checking both Document and Page history
    doc_history = Document.history.filter(history_user=request.user)
    page_history = Page.history.filter(history_user=request.user)

    latest_doc = doc_history.latest() if doc_history.exists() else None
    latest_page = page_history.latest() if page_history.exists() else None

    if latest_doc and latest_page:
        context["latest_doc"] = latest_page if latest_page.history_date > latest_doc.history_date else latest_doc
    elif latest_page:
        context["latest_doc"] = latest_page
    else:
        context["latest_doc"] = latest_doc

    # Scope: all docs across orgs the user belongs to
    org_ids = request.user.userrole_set.values_list("organization", flat=True)
    qs = (
        Document.objects.filter(collection__owner__in=org_ids)
        .select_related("collection", "series")
    )

    # --- search ---
    q = request.GET.get("search", "").strip()
    if q:
        # When searching, search ALL documents
        qs = qs.filter(
            Q(identifier__icontains=q)
            | Q(id__icontains=q)
            | Q(collection__name__icontains=q)
            | Q(series__name__icontains=q)
        )
    else:
        # When NOT searching, show only last 10 documents the user edited
        # Get document IDs from history, ordered by most recent edit
        recent_doc_ids = (
            Document.history.filter(history_user=request.user)
            .values('id')
            .distinct()
            .order_by('-history_date')[:10]
            .values_list('id', flat=True)
        )
        
        # Filter queryset to only these documents
        if recent_doc_ids:
            qs = qs.filter(id__in=recent_doc_ids)
        else:
            # If user hasn't edited anything, show empty queryset
            qs = qs.none()

    # --- filter dropdown ---
    filter_type = request.GET.get("filter", "")
    if filter_type == "collections":
        qs = qs.exclude(collection__isnull=True)
    elif filter_type == "series":
        qs = qs.exclude(series__isnull=True)
    # 'documents' and '' => no extra filter

    # --- last updated annotation via django-simple-history ---
    # Use the model bound to Document.history to avoid a direct import.
    hist_model = Document.history.model  # e.g., HistoricalDocument
    last_updated_sq = Subquery(
        hist_model.objects.filter(id=OuterRef("id"))
        .order_by("-history_date")
        .values("history_date")[:1]
    )
    qs = qs.annotate(_last_updated=last_updated_sq)

    # --- sorting ---
    sort = request.GET.get("sort", "")
    direction = request.GET.get("dir", "desc")
    sort_map = {
        "id": "id",
        "identifier": "identifier",
        "collection": "collection__name",
        "series": "series__name",
        "updated": "_last_updated",
    }
    field = sort_map.get(sort, "_last_updated")
    if direction == "desc":
        field = f"-{field}"
    qs = qs.order_by(field, "id")  # stable tie-breaker

    # --- pagination ---
    page_number = request.GET.get("page", 1)
    paginator = Paginator(qs, 10)  # 10 per page
    page_obj = paginator.get_page(page_number)

    # Keep current params (except page) so sort/view/filter persist on links
    keep_params = urlencode({k: v for k, v in request.GET.items() if k != "page"})

    context.update(
        {
            "documents": page_obj.object_list,
            "page_obj": page_obj,
            "paginator": paginator,
            "keep_params": keep_params,
            "current_sort": sort,
            "current_dir": direction,
            "current_view": request.GET.get("view", "list"),
            "current_filter": filter_type or "all",
            "current_search": q,
        }
    )
    return render(request, "biblios/index.html", context)


def scan(request):
    context = {
        "allowed_upload_types": settings.ALLOWED_UPLOAD_TYPES,
        "max_upload_size": settings.MAX_UPLOAD_SIZE,
    }
    return render(request, "biblios/scan.html", context)


@require_http_methods(["GET"])
def search_documents(request):
    """
    Search endpoint for documents with fuzzy matching.
    Returns JSON list of documents matching the query.
    Searches by document identifier, collection name, and series name.
    """
    query = request.GET.get("q", "").strip()

    if not query or not request.user.is_authenticated:
        return JsonResponse({"results": []})

    user_orgs = request.user.userrole_set.values_list("organization", flat=True)
    results = (
        Document.objects
        .filter(collection__owner__in=user_orgs)
        .filter(
            Q(identifier__icontains=query) |
            Q(collection__name__icontains=query) |
            Q(series__name__icontains=query)
        )
        .select_related("collection", "collection__owner", "series", "metadata")
        .distinct()[:20]
    )

    def get_title(doc):
        try:
            title = doc.metadata.title
            if isinstance(title, list) and title:
                return str(title[0])
        except Document.metadata.RelatedObjectDoesNotExist:
            pass
        return doc.identifier

    return JsonResponse({
        "results": [
            {
                "identifier": doc.identifier,
                "title": get_title(doc),
                "url": doc.get_absolute_url(),
                "collection": doc.collection.name,
                "series": doc.series.name if doc.series else None,
                "organization": doc.collection.owner.short_name,
            }
            for doc in results
        ]
    })
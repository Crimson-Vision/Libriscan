import logging

from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q

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
        user_orgs = request.user.userrole_set.values_list("organization", flat=True)
        
        # The most recent doc the user edited (existing code)
        recent = Document.history.filter(history_user=request.user)
        context["latest_doc"] = recent.latest() if recent.exists() else None
        
        # For Tabs: Where You Left Off - Recent TextBlock edits
        from biblios.models import TextBlock
        from django.core.paginator import Paginator
        
        recent_history = (
            TextBlock.history
            .filter(history_user=request.user)
            .select_related('page__document', 'page__document__collection')
            .order_by('-history_date')[:20]
        )
        
        seen_ids = set()
        unique_textblocks = []
        for hist_record in recent_history:
            if hist_record.id not in seen_ids:
                seen_ids.add(hist_record.id)
                unique_textblocks.append({
                    'id': hist_record.id,
                    'text': hist_record.text,
                    'page': hist_record.page,
                    'modified': hist_record.history_date,
                    'modified_by': hist_record.history_user,
                })
                if len(unique_textblocks) >= 5:
                    break
        
        context["recent_textblocks"] = unique_textblocks
        
        # For Tabs: Pending Reviews - Only for staff (10 per page)
        if request.user.is_staff:
            pending = (
                Document.objects
                .filter(
                    collection__owner__in=user_orgs,
                    status='pending'
                )
                .select_related('collection', 'collection__owner', 'series')
                .order_by('identifier')  # Fix unordered warning
            )
            pending_paginator = Paginator(pending, 10)
            pending_page = request.GET.get('pending_page', 1)
            context["pending_reviews"] = pending_paginator.get_page(pending_page)
        else:
            context["pending_reviews"] = None
        
        # For Tabs: All Documents - Role-based with pagination (10 per page)
        # Users see documents from all organizations they have access to
        all_docs = (
            Document.objects
            .filter(collection__owner__in=user_orgs)
            .select_related('collection', 'collection__owner', 'series')
            .order_by('identifier')  # Order by identifier for consistent pagination
        )
        
        # Paginate All Documents - 10 per page
        all_docs_paginator = Paginator(all_docs, 10)
        all_docs_page = request.GET.get('page', 1)
        context["all_documents"] = all_docs_paginator.get_page(all_docs_page)
        
        # Keep existing documents context
        context["documents"] = Document.objects.filter(
            collection__owner__in=user_orgs
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
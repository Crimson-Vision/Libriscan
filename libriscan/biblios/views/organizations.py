import logging
from django.shortcuts import render

from django.views.generic import DetailView
from django.views.generic.edit import CreateView, UpdateView

from rules.contrib.views import permission_required

from biblios.models import Organization, Collection, Series
from .base import OrgPermissionRequiredMixin, get_org_by_collection

logger = logging.getLogger("django")


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

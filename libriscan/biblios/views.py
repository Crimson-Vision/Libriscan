import logging

from django.shortcuts import render
from django.views.generic import ListView, DetailView

from rules.contrib.views import AutoPermissionRequiredMixin

from .models import Organization, Consortium, Document

logger = logging.getLogger(__name__)


def index(request):
    orgs = Organization.objects.all()
    context = {"app_name": "Libriscan", "orgs": orgs}
    return render(request, "biblios/index.html", context)


def organization_list(request):
    orgs = request.user.userrole_set.all()
    context = {'orgs':orgs}
    return render(request, "biblios/organization_list.html", context)


class OrganizationDetail(AutoPermissionRequiredMixin, DetailView):
    model = Organization
    context_object_name = "org"


class ConsortiumDetail(AutoPermissionRequiredMixin, DetailView):
    model = Consortium
    context_object_name = "consortium"


class DocumentList(AutoPermissionRequiredMixin, ListView):
    model = Document

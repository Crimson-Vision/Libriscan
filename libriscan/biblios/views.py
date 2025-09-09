import logging

from django.shortcuts import render
from django.views.generic import ListView, DetailView

from .models import Organization, Consortium

logger = logging.getLogger(__name__)

def index(request):
    orgs = Organization.objects.all()
    context = {
        "app_name": "Libriscan",
        "orgs":orgs
    }
    return render(request, "biblios/index.html", context)


class OrganizationList(ListView):
    model = Organization
    context_object_name = "orgs"


class OrganizationDetail(DetailView):
    model = Organization
    context_object_name = "org"


class ConsortiumDetail(DetailView):
    model = Consortium
    context_object_name = "consortium"
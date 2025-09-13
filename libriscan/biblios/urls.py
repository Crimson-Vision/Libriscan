from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("organizations", views.organization_list, name="organization-list"),
    path("organizations/<int:pk>", views.OrganizationDetail.as_view(), name="organization"),
    path("consortiums/<int:pk>", views.ConsortiumDetail.as_view(), name="consortium"),
]
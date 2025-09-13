from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("organizations", views.OrganizationList.as_view(), name="organization-list"),
    path("organizations/<int:pk>", views.OrganizationDetail.as_view(), name="organization"),
    path("consortiums/<int:pk>", views.ConsortiumDetail.as_view(), name="consortium"),
    path("sample/", views.sample, name="sample"),
]
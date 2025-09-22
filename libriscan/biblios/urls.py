from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("scan/", views.scan, name="scan"),
    path("organizations", views.organization_list, name="organization-list"),
    path(
        "organizations/<int:pk>",
        views.OrganizationDetail.as_view(),
        name="organization",
    ),
    path(
        "organization/<slug:short_name>/",
        views.OrganizationDetail.as_view(),
        name="org_slug",
    ),
    path(
        "organization/<slug:short_name>/<int:pk>",
        views.collection_detail,
        name="collection",
    ),
    path("consortiums/<int:pk>", views.ConsortiumDetail.as_view(), name="consortium"),
]

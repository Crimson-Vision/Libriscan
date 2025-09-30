from django.urls import include, path

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
        "<slug:short_name>/",
        views.OrganizationDetail.as_view(),
        name="org_slug",
    ),
    # Collection URLs
    path(
        "<slug:short_name>/<int:pk>",
        views.collection_detail,
        name="collection",
    ),
    path("consortiums/<int:pk>", views.ConsortiumDetail.as_view(), name="consortium"),
    # Document URLs
    path(
        "<slug:short_name>/<int:collection_id>/document/",
        include(
            [
                path(
                    "new",
                    views.DocumentCreateView.as_view(),
                    name="document_create",
                ),
                path(
                    "<int:pk>",
                    views.DocumentDetail.as_view(),
                    name="document",
                ),
                path(
                    "<int:pk>/pdf",
                    views.export_pdf,
                    {"use_image": True},
                    name="export_pdf",
                ),
                path(
                    "<int:pk>/pdftext",
                    views.export_pdf,
                    {"use_image": False},
                    name="export_textpdf",
                ),
                path("<int:pk>/text", views.export_text, name="export_text"),
                # page URLs
                path(
                    "<int:document_id>/new",
                    views.PageCreateView.as_view(),
                    name="page_create",
                ),
                path(
                    "<int:document_id>/page<int:number>",
                    views.PageDetail.as_view(),
                    name="page",
                ),
                path(
                    "<int:document_id>/page<int:number>/extract",
                    views.PageDetail.as_view(),
                    name="extract",
                ),
            ]
        ),
    ),
]

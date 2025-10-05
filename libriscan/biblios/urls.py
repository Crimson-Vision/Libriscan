from django.urls import include, path

from . import views

urlpatterns = [
    # Core pages
    path("", views.index, name="index"),
    path("scan/", views.scan, name="scan"),
    
    # File handling
    path("upload/", views.handle_upload, name="handle_upload"),
    
    # Organization structure
    path("consortiums/<int:pk>/", views.ConsortiumDetail.as_view(), name="consortium"),
    path("organizations", views.organization_list, name="organization-list"),
    path(
        "<slug:short_name>/",
        views.OrganizationDetail.as_view(),
        name="organization",
    ),
    # Collection URLs
    path(
        "<slug:short_name>/<slug:collection_slug>/",
        include(
            [
                path(
                    "",
                    views.collection_detail,
                    name="collection",
                ),
                path(
                    "new-document/",
                    views.DocumentCreateView.as_view(),
                    name="document_create",
                ),
                path(
                    "<slug:series_slug>-series/",
                    views.SeriesDetail.as_view(),
                    name="series",
                ),
                # Document URLs
                path(
                    "<slug:identifier>/",
                    include(
                        [
                            path(
                                "",
                                views.DocumentDetail.as_view(),
                                name="document",
                            ),
                            path(
                                "pdf/",
                                views.export_pdf,
                                {"use_image": True},
                                name="export_pdf",
                            ),
                            path(
                                "pdftext/",
                                views.export_pdf,
                                {"use_image": False},
                                name="export_textpdf",
                            ),
                            path("text/", views.export_text, name="export_text"),
                            # page URLs
                            path(
                                "page/new",
                                views.PageCreateView.as_view(),
                                name="page_create",
                            ),
                            path(
                                "page/<int:number>/",
                                views.PageDetail.as_view(),
                                name="page",
                            ),
                            path(
                                "page<int:number>/extract/",
                                views.extract_text,
                                name="page_extract",
                            ),
                        ]
                    ),
                ),
            ]
        ),
    ),
]

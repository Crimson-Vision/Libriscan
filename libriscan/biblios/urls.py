from django.urls import include, path

from . import views

urlpatterns = [
    # Core pages
    path("", views.index, name="index"),
    path("scan/", views.scan, name="scan"),
    # File handling
    path("upload/", views.handle_upload, name="handle_upload"),
    path("organizations", views.organization_list, name="organization-list"),
    # Organization details
    path(
        "<slug:short_name>/",
        include(
            [
                path("", views.OrganizationDetail.as_view(), name="organization"),
                path(
                    "update/",
                    views.OrganizationUpdate.as_view(),
                    name="organization_update",
                ),
                path(
                    "new-collection/",
                    views.CollectionCreate.as_view(),
                    name="collection_create",
                ),
                # Collection URLs
                path(
                    "<slug:collection_slug>/",
                    include(
                        [
                            path(
                                "",
                                views.collection_detail,
                                name="collection",
                            ),
                            path(
                                "update/",
                                views.CollectionUpdate.as_view(),
                                name="collection_update",
                            ),
                            path(
                                "new-document/",
                                views.DocumentCreateView.as_view(),
                                name="document_create",
                            ),
                            path(
                                "new-series/",
                                views.SeriesCreateView.as_view(),
                                name="series_create",
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
                                            "metadata/",
                                            views.MetadataDetail.as_view(),
                                            name="metadata",
                                        ),
                                        path(
                                            "metadata/update",
                                            views.MetadataUpdateView.as_view(),
                                            name="metadata_update",
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
                                        path(
                                            "text/",
                                            views.export_text,
                                            name="export_text",
                                        ),
                                        path(
                                            "xml/",
                                            views.export_xml,
                                            name="export_xml",
                                        ),
                                        # page URLs
                                        path(
                                            "page/new",
                                            views.PageCreateView.as_view(),
                                            name="page_create",
                                        ),
                                        path(
                                            "page<int:number>/",
                                            views.PageDetail.as_view(),
                                            name="page",
                                        ),
                                        path(
                                            "page<int:number>/extract/",
                                            views.extract_text,
                                            name="page_extract",
                                        ),
                                        path(
                                            "page<int:number>/words/",
                                            views.check_words,
                                            name="page_words",
                                        ),
                                        path(
                                            "page<int:number>/word/<int:word_id>/update/",
                                            views.update_word,
                                            name="update_word",
                                        ),
                                        path(
                                            "page<int:number>/word/<int:word_id>/print-control/",
                                            views.update_print_control,
                                            name="update_print_control",
                                        ),
                                        path(
                                            "page<int:number>/word/<int:word_id>/text-type/",
                                            views.update_text_type,
                                            name="update_text_type",
                                        ),
                                        path(
                                            "page<int:number>/word/<int:word_id>/history/",
                                            views.textblock_history,
                                            name="textblock_history",
                                        ),
                                    ]
                                ),
                            ),
                        ]
                    ),
                ),
            ]
        ),
    ),
]

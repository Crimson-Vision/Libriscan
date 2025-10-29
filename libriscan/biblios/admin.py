from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.forms.widgets import PasswordInput
from django.forms import ModelForm

from .models import User, UserRole, Organization, CloudService
from .models import Collection, Series, Document, Page, TextBlock, DublinCoreMetadata

from .forms import CustomUserChangeForm, CustomUserCreationForm


admin.site.site_header = "Libriscan Administration"
admin.site.site_title = "Libriscan Admin"
admin.site.index_title = "Libriscan Admin"


class SeriesInline(admin.TabularInline):
    model = Series
    extra = 1
    verbose_name_plural = "Series"
    prepopulated_fields = {"slug": ["name"]}


class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 0


class PagesInline(admin.StackedInline):
    model = Page
    extra = 0


class CloudServiceForm(ModelForm):
    class Meta:
        fields = ["service", "client_id", "client_secret"]
        model = CloudService
        widgets = {"client_secret": PasswordInput}


class CloudServiceInline(admin.StackedInline):
    model = CloudService
    form = CloudServiceForm
    extra = 1


class MetadataInline(admin.StackedInline):
    model = DublinCoreMetadata
    extra = 1


@admin.register(Organization)
class OrgAdmin(admin.ModelAdmin):
    inlines = [CloudServiceInline]
    list_display = ["name", "city", "state"]


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    inlines = [SeriesInline]
    list_display = ["name", "owner"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ["identifier", "series", "series__collection"]
    inlines = [PagesInline, MetadataInline]


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ["number", "document", "document__series__collection__owner"]


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "user__first_name",
        "user__last_name",
        "organization",
        "role",
    ]


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = (
        "first_name",
        "last_name",
        "email",
        "is_staff",
        "is_active",
    )
    list_filter = (
        "email",
        "is_staff",
        "is_active",
    )
    fieldsets = (
        (None, {"fields": ("first_name", "last_name")}),
        (None, {"fields": ("email", "password")}),
        (
            "Permissions",
            {"fields": ("is_staff", "is_active", "groups", "user_permissions")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
    )
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)


admin.site.register(User, CustomUserAdmin)


class TextAdmin(admin.ModelAdmin):
    search_fields = ("text",)

    list_display = ["text", "page__document", "page"]
    list_filter = ["page__document", "page"]
    ordering = ("page__document", "page", "line", "number")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "text",
                    "text_type",
                    "print_control",
                    "confidence",
                )
            },
        ),
        (
            "Position",
            {
                "fields": (
                    ("line", "number"),
                    ("geo_x_0", "geo_y_0"),
                    ("geo_x_1", "geo_y_1"),
                )
            },
        ),
        (None, {"fields": ("suggestions",)}),
    )


admin.site.register(TextBlock, TextAdmin)

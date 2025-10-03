from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, UserRole, Organization, Consortium, Membership, CloudService
from .models import Collection, Series, Document, Page, TextBlock

from .forms import CustomUserChangeForm, CustomUserCreationForm


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0


class SeriesInline(admin.TabularInline):
    model = Series
    extra = 1
    verbose_name_plural = "Series"
    

class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 0


class PagesInline(admin.StackedInline):
    model = Page
    extra = 0

class CloudServiceInline(admin.StackedInline):
    model = CloudService
    extra = 1


@admin.register(Organization)
class OrgAdmin(admin.ModelAdmin):
    inlines = [MembershipInline, CloudServiceInline]
    list_display = ['name', 'city', 'state']


@admin.register(Consortium)
class ConsortiumAdmin(admin.ModelAdmin):
    pass


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    inlines = [SeriesInline]
    list_display = ["name", "owner"]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ["identifier", "series", "series__collection"]
    inlines = [PagesInline]


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ["number", "document", "document__series__collection__owner"]


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ["user", "organization", "role"]

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
    search_fields = ("document", "page")
    list_display = ["text", "page__document", "page"]
    list_filter = ["page__document", "page"]


admin.site.register(TextBlock, TextAdmin)

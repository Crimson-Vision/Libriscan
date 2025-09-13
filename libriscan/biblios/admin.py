from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Organization, Consortium, Membership, Collection, Series, Document, Page, TextBlock, UserRole



class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0

class SeriesInline(admin.TabularInline):
    model = Series
    extra = 1
    verbose_name_plural = 'Series'

class TextBlockInline(admin.StackedInline):
    model = TextBlock
    extra = 1

class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 0


class PagesInline(admin.StackedInline):
    model = Page
    extra = 0


@admin.register(Organization)
class OrgAdmin(admin.ModelAdmin):
    inlines = [MembershipInline]
    list_display = ['name', 'city', 'state']


@admin.register(Consortium)
class ConsortiumAdmin(admin.ModelAdmin):
    pass


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    inlines = [SeriesInline]
    list_display = ['name', 'owner']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['identifier', 'series', 'series__collection']
    inlines = [PagesInline]


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    inlines = [TextBlockInline]
    list_display = ['number', 'document', 'document__series__collection__owner']


admin.site.register(User, UserAdmin)

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'role']


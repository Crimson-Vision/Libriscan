from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Organization, Consortium, Membership, Collection, Series, Document, Page, TextBlock



class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0

class SeriesInline(admin.TabularInline):
    model = Series
    extra = 1

class TextBlockInline(admin.StackedInline):
    model = TextBlock
    extra = 1

@admin.register(Organization)
class OrgAdmin(admin.ModelAdmin):
    inlines = [MembershipInline]


@admin.register(Consortium)
class ConsortiumAdmin(admin.ModelAdmin):
    pass


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    inlines = [SeriesInline]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    pass


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    inlines = [TextBlockInline]


admin.site.register(User, UserAdmin)


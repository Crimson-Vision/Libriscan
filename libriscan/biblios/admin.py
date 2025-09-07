from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Organization, Consortium, Membership



class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0


@admin.register(Organization)
class OrgAdmin(admin.ModelAdmin):
    inlines = [MembershipInline]


@admin.register(Consortium)
class ConsortiumAdmin(admin.ModelAdmin):
    pass


admin.site.register(User, UserAdmin)


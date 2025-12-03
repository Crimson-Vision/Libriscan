from django import template
from biblios.access_rules import is_org_viewer, is_org_editor, is_org_archivist
from biblios.models import UserRole

register = template.Library()


@register.filter
def can_view_org(user, org):
    """Check if user can view organization."""
    if not user.is_authenticated:
        return False
    return is_org_viewer(user, org)


@register.filter
def can_edit_org(user, org):
    """Check if user can edit organization (Editor or Archivist, not Guest)."""
    if not user.is_authenticated:
        return False
    return is_org_editor(user, org)


@register.filter
def can_admin_org(user, org):
    """Check if user is archivist in organization."""
    if not user.is_authenticated:
        return False
    return is_org_archivist(user, org)


@register.filter
def is_guest(user, org):
    """Check if user is a guest in the organization."""
    if not user.is_authenticated:
        return True
    return user.userrole_set.filter(
        organization=org, role=UserRole.GUEST
    ).exists()



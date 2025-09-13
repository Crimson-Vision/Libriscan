import rules

import logging

logger = logging.getLogger(__name__)


@rules.predicate
def is_org_archivist(user, org):
    from .models import UserRole

    logger.info(F"Checking if {user} is {org} archivist")

    # Only archivists count here
    return user.userrole_set.filter(
        user=user, organization=org, role=UserRole.ARCHIVIST
    ).exists()


@rules.predicate
def is_org_editor(user, org):
    from .models import UserRole

    # Editors and archivists have count as "editors"
    return user.userrole_set.filter(user=user, organization=org, role__in=[UserRole.EDITOR, UserRole.ARCHIVIST]).exists()


@rules.predicate
def is_org_viewer(user, org):
    # Anyone with any role at an org can view its objects
    # This means we don't need to do anything specific for guests
    return user.userrole_set.filter(user=user, organization=org).exists()

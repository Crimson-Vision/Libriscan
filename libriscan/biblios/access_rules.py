import rules

import logging

logger = logging.getLogger(__name__)


@rules.predicate
def is_org_archivist(user, org):
    from .models import UserRole

    logger.info(F"Checking if {user} is {org} archivist")

    return user.userrole_set.filter(
        user=user, organization=org, role=UserRole.ARCHIVIST
    ).exists()


@rules.predicate
def is_org_editor(user, org):
    from .models import UserRole

    return user.userrole_set.filter(user=user, organization=org, role__in=[UserRole.EDITOR, UserRole.ARCHIVIST]).exists()


# Anyone with any role at an org can view its objects
@rules.predicate
def is_org_viewer(user, org):
    return user.userrole_set.filter(user=user, organization=org).exists()

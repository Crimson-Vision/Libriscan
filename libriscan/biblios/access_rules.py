import rules


@rules.predicate
def is_org_archivist(user, org):
    from .models.UserRole import ARCHIVIST

    return user.userrole_set.filter(
        user=user, organization=org, role=ARCHIVIST
    ).exists()


@rules.predicate
def is_org_editor(user, org):
    from .models.UserRole import EDITOR

    return user.userrole_set.filter(user=user, organization=org, role=EDITOR).exists()


# Anyone with any role at an org can view its objects
@rules.predicate
def is_org_viewer(user, org):
    return user.userrole_set.filter(user=user, organization=org).exists()

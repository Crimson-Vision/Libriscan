# Run ONCE with: 
# 
# (bash) python manage.py shell < setup_staff_group.py
#
# OR
#
# (Powershell) Get-Content setup_staff_group.py | python manage.py shell
#
# How to extend this
# ========================================================================
#
# To add permissions for a new model:
#   1. Add the model to the 'models' list in this script
#   2. Re-run this script to update the Group permissions
#   3. Add object-level permission rules in access_rules.py (if needed)
#  4. Add queryset filtering in admin.py (if multi-tenant)
#
# To create additional groups with different permissions:
# * Copy this script and modify the group name and models list
# * Example: Create a "Libriscan Viewers" group with only view permissions

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from libriscan.models import (
    Organization, Collection, Series, Document, Page, 
    TextBlock, UserRole, User, CloudService, DublinCoreMetadata
)

print("Setting up 'Libriscan Admin Staff' Group (One-Time Setup)...")

# Create the "Libriscan Admin Staff" group
staff_group, created = Group.objects.get_or_create(name='Libriscan Admin Staff')

# sPECIFY the models that staff should have access to
models = [
    User,
    UserRole,
    Organization,
    Collection,
    Series,
    Document,
    Page,
    TextBlock,
    CloudService,
    DublinCoreMetadata
]

# Add all permissions for these models to the group
permission_count = 0

for model in models:
    content_type = ContentType.objects.get_for_model(model)
    permissions = Permission.objects.filter(content_type=content_type)
    
    for perm in permissions:
        if perm not in staff_group.permissions.all():
            staff_group.permissions.add(perm)
            permission_count += 1
            print(f"Added: {model.__name__}.{perm.codename}")

if permission_count == 0:
    print("Group already has all permissions")

# Add all existing staff users to the group
staff_users = User.objects.filter(is_staff=True, is_superuser=False)

if staff_users.exists():
    user_count = 0
    for user in staff_users:
        if staff_group not in user.groups.all():
            user.groups.add(staff_group)
            user_count += 1
            print(f"Added user: {user.email}")
    
    if user_count == 0:
        print("All staff users already in group")
else:
    print("No staff users found")

print("Libriscan Admin Staff Security Group - Setup Done!")
import os
import django
import sys

# Set up Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from quiz.models import Category, Subcategory, Question

def setup_roles():
    # Create the group
    group, created = Group.objects.get_or_create(name='Content Creators')
    
    # ContentTypes for models
    models = [Category, Subcategory, Question]
    content_types = ContentType.objects.get_for_models(*models).values()
    
    # We want add, view, and change permissions (NOT delete)
    codenames = []
    for model in models:
        model_name = model._meta.model_name
        codenames.extend([
            f'add_{model_name}',
            f'change_{model_name}',
            f'view_{model_name}'
        ])
        
    permissions = Permission.objects.filter(
        content_type__in=content_types,
        codename__in=codenames
    )
    
    group.permissions.set(permissions)
    print("✅ Created 'Content Creators' group with add/change/view permissions for Quiz models.")
    
    # Create a user
    username = 'creator'
    password = 'creatorpassword123'
    
    user, user_created = User.objects.get_or_create(username=username)
    if user_created:
        user.set_password(password)
        # is_staff must be True to log into the admin portal
        user.is_staff = True 
        user.is_superuser = False
        user.save()
        user.groups.add(group)
        print(f"✅ Created new user '{username}' with password '{password}' and assigned to group.")
    else:
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = False
        user.save()
        user.groups.add(group)
        print(f"✅ Updated existing user '{username}' and assigned to 'Content Creators' group.")

if __name__ == "__main__":
    setup_roles()

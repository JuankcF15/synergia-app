from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_default_superuser(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    if not User.objects.filter(username='admin@synergia.com').exists():
        User.objects.create(
            username='admin@synergia.com',
            email='admin@synergia.com',
            is_staff=True,
            is_superuser=True,
            password=make_password('admin1234')
        )

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0005_business_img'),
    ]

    operations = [
        migrations.RunPython(create_default_superuser),
    ]

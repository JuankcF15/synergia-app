from django.db import models
from django.contrib.auth.models import User

class Business(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='business')
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    nit = models.CharField(max_length=20, unique=True)
    num_empleados =models.IntegerField(default=0)
    country = models.CharField(max_length=100, blank=True, null=True)
    img = models.ImageField(upload_to='business_images/', blank=True, null=True)

    def __str__(self):
        return self.name

from django.db import models
from api.models import Business

class Employee(models.Model):
    company = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='employees')
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    position = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
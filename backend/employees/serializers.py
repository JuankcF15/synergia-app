from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    """ Serializer for the Employee model, including a read-only field for the company name. """
    company = serializers.ReadOnlyField(source='company.name')  # Campo de solo lectura

    class Meta:
        model = Employee
        fields = ['id', 'name', 'email', 'position', 'department', 'is_active', 'company']  # Incluye 'company' como solo lectura

    def validate_email(self, value):
        """  Validates that the email is unique within the same company."""
        employee = self.instance

        # Verificar si el correo ya existe para otro empleado en la misma empresa
        company = self.context['request'].user.business
        if employee and employee.email != value:  # Asegurarse de que no estamos verificando el correo del mismo empleado
            if Employee.objects.filter(email=value, company=company).exists():
                raise serializers.ValidationError("El correo ya está registrado para otro empleado.")
        
        return value
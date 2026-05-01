from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Employee
from .serializers import EmployeeSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class EmployeeViewSet(viewsets.ModelViewSet):
    """ ViewSet to handle CRUD operations for Employee model."""
    permission_classes = [IsAuthenticated]
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        """ Return the employees associated with the authenticated user's business."""
        return Employee.objects.filter(company=self.request.user.business)

    def perform_create(self, serializer):
        """ Save the employee with the authenticated user's business as the company."""
        serializer.save(company=self.request.user.business)

    @action(detail=True, methods=['patch'], url_path='disable')
    def disable_employee(self, request, pk=None):
        """ Disable an employee by setting is_active to False."""
        employee = self.get_object()
        employee.is_active = False
        employee.save()
        return Response({"message": "Empleado deshabilitado correctamente."}, status=status.HTTP_200_OK)
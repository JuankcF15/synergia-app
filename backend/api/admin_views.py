from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from api.models import Business
from employees.models import Employee
from survey.models import SurveyResponse, Answer, Question
from django.db.models import Avg, Count
from rest_framework import status
from django.http import HttpResponse, FileResponse
import csv
import pandas as pd
from django.utils.text import slugify
import tempfile
import os
from api.serializers import BusinessSerializer

class AdminCompaniesAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Devuelve todas las empresas con cantidad de empleados y promedio de encuestas."""
        companies = Business.objects.all()
        data = []
        for company in companies:
            empleados_count = Employee.objects.filter(company=company).count()
            # Promedio general de todas las respuestas de empleados de la empresa
            responses = SurveyResponse.objects.filter(employee__company=company)
            answers = Answer.objects.filter(response__in=responses)
            promedio = answers.aggregate(avg=Avg('value'))['avg']
            data.append({
                'id': company.id,
                'name': company.name,
                'num_empleados': empleados_count,
                'promedio': round(promedio, 2) if promedio is not None else None,
                'country': company.country,
                'img': request.build_absolute_uri(company.img.url) if company.img else None,
            })
        return Response(data)

class AdminExportAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Exporta los datos globales de todas las empresas y sus resultados de encuestas en CSV."""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="synergia_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Empresa', 'País', 'Empleado', 'Email', 'Departamento', 'Puesto', 'Promedio Empleado'])
        companies = Business.objects.all()
        for company in companies:
            empleados = Employee.objects.filter(company=company)
            for empleado in empleados:
                responses = SurveyResponse.objects.filter(employee=empleado)
                answers = Answer.objects.filter(response__in=responses)
                promedio = answers.aggregate(avg=Avg('value'))['avg']
                writer.writerow([
                    company.name,
                    company.country,
                    empleado.name,
                    empleado.email,
                    empleado.department,
                    empleado.position,
                    round(promedio, 2) if promedio is not None else None
                ])
        return response

class AdminCompanyDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, company_id):
        """Devuelve todos los datos de una empresa específica por id (admin)."""
        try:
            company = Business.objects.get(id=company_id)
        except Business.DoesNotExist:
            return Response({'error': 'Empresa no encontrada.'}, status=404)
        serializer = BusinessSerializer(company, context={'request': request})
        return Response(serializer.data)

class AdminExportAllSurveysAPIView(APIView):
    """ View tp export all survey responses from all companies in a CSV file."""
    # No requiere autenticación
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        questions = list(Question.objects.all().order_by('order'))
        question_headers = [f'Pregunta {q.order}' for q in questions]
        empresas = Business.objects.all()
        data = []
        for empresa in empresas:
            empleados = Employee.objects.filter(company=empresa)
            responses = SurveyResponse.objects.filter(employee__in=empleados).order_by('submitted_at')
            for resp in responses:
                answers_dict = {a.question_id: a.value for a in resp.answers.all()}
                row = [empresa.id, empresa.name, resp.submitted_at.strftime('%d/%m/%Y')]
                for q in questions:
                    row.append(answers_dict.get(q.id, ''))
                data.append(row)
        columns = ['id Empresa', 'Empresa', 'Fecha'] + question_headers
        df = pd.DataFrame(data, columns=columns)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='w', encoding='utf-8-sig', newline='') as tmp:
            df.to_csv(tmp.name, index=False)
            tmp.seek(0)
            response = FileResponse(open(tmp.name, 'rb'), as_attachment=True, filename='synergia_export.csv')
            return response

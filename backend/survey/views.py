from rest_framework import generics, status
from .models import Dimension, SurveyResponse
from .serializers import DimensionSerializer, SurveyResponseSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from employees.models import Employee
from .models import Question, Answer
import random, string
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AccessCode
from .serializers import AccessCodeSerializer
from rest_framework.exceptions import ValidationError
from django.db.models import Avg, StdDev
from django.http import HttpResponse
import csv
import pandas as pd
import re
from django.utils.text import slugify
from django.http import FileResponse
import tempfile
import os
from django.core.mail import send_mail


class DimensionListAPIView(generics.ListAPIView):
    """  List all dimensions with their associated questions."""
    queryset = Dimension.objects.prefetch_related('questions').all()
    serializer_class = DimensionSerializer
    permission_classes = [AllowAny]

class SurveyResponseCreateAPIView(generics.CreateAPIView):
    """ Create a new survey response, associating it with an employee using an access code."""
    queryset = SurveyResponse.objects.all()
    serializer_class = SurveyResponseSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        """ Save the survey response and associate it with an employee using an access code."""
        access_code = self.request.data.get('access_code')
        print("Access Code:", access_code)

        try:
            # Verificar si el código de acceso existe y no ha sido utilizado
            access_code_obj = AccessCode.objects.get(code=access_code)

        except AccessCode.DoesNotExist:
            raise ValidationError("Código de acceso no válido.")

        # Obtener el empleado asociado al código de acceso
        employee = access_code_obj.employee
    

        # Obtener las respuestas de la encuesta
        answers_data = self.request.data.get('answers')

        # Crear la respuesta de la encuesta y asociarla al empleado
        survey_response = serializer.save(employee=employee)

        # Crear las respuestas individuales
        answers = []
        for answer_data in answers_data:
            question = Question.objects.get(id=answer_data['question'])
            answers.append(Answer(response=survey_response, question=question, value=answer_data['value']))

        # Guardar las respuestas de manera eficiente
        Answer.objects.bulk_create(answers)

def generate_code(length=8):
    """ Generate a random alphanumeric code of specified length."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


class GenerateAccessCodeView(APIView):
    """ Generate a new access code for an employee."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """ Generate a new access code for the specified employee and send it by email."""
        employee_id = request.data.get('employee_id')
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Empleado no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        code_str = generate_code()
        code = AccessCode.objects.create(code=code_str, employee=employee)

        # Send email to employee with the access code and instructions
        subject = 'Código de acceso para encuesta - Synergia'
        message = f"Hola {employee.name},\n\nTu código de acceso para la encuesta es: {code_str}\n\nImportante: El código se marcará como usado en cuanto hagas clic en 'Comenzar encuesta'. Si ocurre algún error y no puedes acceder, por favor contacta al administrador de tu empresa para que te genere un nuevo código.\n\nGracias por participar.\n\nEquipo Synergia"
        recipient_list = [employee.email]
        send_mail(
            subject,
            message,
            None,  # Usa DEFAULT_FROM_EMAIL
            recipient_list,
            fail_silently=False,
        )

        serializer = AccessCodeSerializer(code)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ListAccessCodesByEmployeeView(generics.ListAPIView):
    """ List all access codes associated with a specific employee."""
    serializer_class = AccessCodeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """ Return access codes for the specified employee."""
        employee_id = self.kwargs['employee_id']
        return AccessCode.objects.filter(employee__id=employee_id).order_by('-created_at')


class ValidateAccessCodeView(APIView):
    """ Validate an access code to check if it is valid and has not been used."""
    permission_classes = [AllowAny]

    def post(self, request):
        """ Validate the access code provided in the request data."""
        code = request.data.get('code')

        if not code:
            return Response({'detail': 'Código de acceso es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Buscar el código en la base de datos
            access_code = AccessCode.objects.get(code=code)

            if access_code.used:
                # Si el código ya ha sido usado
                return Response({'is_valid': False, 'message': 'El código ya ha sido utilizado.'}, status=status.HTTP_200_OK)

            # Si el código es válido, marcarlo como usado
            access_code.used = True
            access_code.save()

            # Responder con que el código es válido
            return Response({'is_valid': True}, status=status.HTTP_200_OK)

        except AccessCode.DoesNotExist:
            # Si el código no existe
            return Response({'is_valid': False, 'message': 'Código no válido.'}, status=status.HTTP_200_OK)
        

class SurveyStatisticsView(APIView):
    """ View to get statistics about survey responses for a specific company."""
    permission_classes = [IsAuthenticated]

    def get(self, request, empresa_id):
        """ Get statistics about survey responses for a specific company."""
        empleados = Employee.objects.filter(company_id=empresa_id)

        # Total de empleados registrados
        total_empleados = empleados.count()

        # Empleados que han respondido
        respuestas = SurveyResponse.objects.filter(employee__in=empleados)
        empleados_respondieron = respuestas.values('employee').distinct().count()

        # Total de respuestas
        total_respuestas = SurveyResponse.objects.filter(employee__in=empleados).count()

        # Promedio general de respuestas (en la escala de 1 a 5)
        promedio_respuestas = Answer.objects.filter(response__in=respuestas).aggregate(promedio=Avg('value'))['promedio']

        # Promedio por pregunta (opcional)
        promedios_por_pregunta = (
            Answer.objects
            .filter(response__in=respuestas)
            .values('question__text')
            .annotate(promedio=Avg('value'))
            .order_by('question__text')
        )

        return Response({
            'total_empleados': total_empleados,
            'empleados_que_respondieron': empleados_respondieron,
            'total_respuestas': total_respuestas,
            'promedio_general': round(promedio_respuestas or 0, 2),
            'promedios_por_pregunta': promedios_por_pregunta
        })
        
class ExportSurveyDataView(APIView):
    """View to export survey responses as a CSV file."""
    permission_classes = [IsAuthenticated]    
    def get(self, request):
        """Export survey responses as a CSV file."""
        # Get the business from the authenticated user
        business = request.user.business

        # Get all questions ordered by order
        questions = Question.objects.all().order_by('order')
        
        # Get responses only from employees of this business
        responses = SurveyResponse.objects.filter(
            employee__company=business
        ).select_related(
            'employee'
        ).prefetch_related(
            'answers__question'
        ).order_by('employee__name', '-submitted_at')

        if not responses.exists():
            return HttpResponse("No hay respuestas disponibles para exportar.", status=400)

        # Create HTTP response as CSV file
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="respuestas_encuesta.csv"'
        writer = csv.writer(response)

        # Create headers with only date and questions
        headers = ['Fecha']
        headers.extend([f'Pregunta {q.order}' for q in questions])
        writer.writerow(headers)

        # Write one row per employee response
        for resp in responses:
            # Crear un diccionario con las respuestas del empleado
            answers_dict = {
                answer.question.order: answer.value 
                for answer in resp.answers.all()
            }
            
            # Crear la fila solo con la fecha
            row = [
                resp.submitted_at.strftime('%d/%m/%Y'),
            ]
            
            # Agregar las respuestas en orden
            row.extend([answers_dict.get(q.order, '') for q in questions])
            writer.writerow(row)

        return response
    
class SurveyAnalysisView(APIView):
    """ View to analyze survey responses and provide descriptive statistics solo para la empresa autenticada."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """ Analyze survey responses and provide descriptive statistics solo para la empresa autenticada."""
        business = request.user.business
        empleados = Employee.objects.filter(company=business)
        respuestas = SurveyResponse.objects.filter(employee__in=empleados)
        dimensiones = Dimension.objects.all()
        resultados = []

        for dimension in dimensiones:
            # Filtrar solo respuestas de empleados de la empresa autenticada y de la dimensión
            answers_dim = Answer.objects.filter(
                response__in=respuestas,
                question__dimension=dimension
            )
            promedio = answers_dim.aggregate(promedio_respuesta=Avg('value'))['promedio_respuesta']
            desviacion_estandar = answers_dim.aggregate(desviacion_estandar=StdDev('value'))['desviacion_estandar']

            # Pregunta con mayor variabilidad dentro de la empresa
            pregunta_mas_variable = answers_dim.values('question').annotate(
                desviacion=StdDev('value')
            ).order_by('-desviacion').first()

            texto_pregunta_mas_variable = None
            if pregunta_mas_variable and pregunta_mas_variable['question']:
                try:
                    texto_pregunta_mas_variable = Question.objects.get(id=pregunta_mas_variable['question']).text
                except Question.DoesNotExist:
                    texto_pregunta_mas_variable = None

            resultados.append({
                'dimensión': dimension.name,
                'promedio': promedio,
                'desviacion_estandar': desviacion_estandar,
                'pregunta_mas_variable': pregunta_mas_variable['question'] if pregunta_mas_variable else None,
                'texto_pregunta_mas_variable': texto_pregunta_mas_variable
            })

        return Response(resultados)
    
class SurveyRecommendationsView(APIView):
    """Genera recomendaciones automáticas y datos para gráficas para la empresa autenticada."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        business = request.user.business
        empleados = Employee.objects.filter(company=business)
        respuestas = SurveyResponse.objects.filter(employee__in=empleados)
        dimensiones = Dimension.objects.all()

        # Promedio general solo de respuestas de la empresa
        promedio_general = Answer.objects.filter(response__in=respuestas).aggregate(prom=Avg('value'))['prom']
        promedio_general = round(promedio_general or 0, 2)

        # Promedios por dimensión solo de la empresa
        promedios_dim = []
        recomendaciones_dim = []
        radar_labels = []
        radar_data = []
        for dim in dimensiones:
            prom = Answer.objects.filter(
                response__in=respuestas,
                question__dimension=dim
            ).aggregate(prom=Avg('value'))['prom']
            prom = round(prom or 0, 2)
            promedios_dim.append({'dimension': dim.name, 'promedio': prom})
            radar_labels.append(dim.name)
            radar_data.append(prom)
            # Reglas automáticas para recomendaciones
            if prom < 2.5:
                recomendaciones_dim.append(f"La dimensión '{dim.name}' tiene un puntaje bajo ({prom}). Se recomienda realizar talleres, capacitaciones o reuniones para mejorar este aspecto.")
            elif prom < 3.5:
                recomendaciones_dim.append(f"La dimensión '{dim.name}' es mejorable (puntaje: {prom}). Considere encuestas internas o focus groups para identificar oportunidades de mejora.")
            else:
                recomendaciones_dim.append(f"La dimensión '{dim.name}' está bien valorada (puntaje: {prom}). Mantenga las buenas prácticas actuales.")

        # Recomendación general
        if promedio_general < 2.5:
            recomendacion_general = "El clima laboral general es bajo. Se recomienda una intervención integral, comunicación directa con los empleados y revisión de procesos internos."
        elif promedio_general < 3.5:
            recomendacion_general = "El clima laboral es aceptable pero mejorable. Considere reforzar la motivación, reconocimiento y espacios de escucha activa."
        else:
            recomendacion_general = "El clima laboral es positivo. Continúe con las estrategias actuales y refuerce la cultura organizacional."

        # Histórico de promedios generales (por mes) solo de la empresa
        historico = (
            Answer.objects.filter(response__in=respuestas)
            .values('response__submitted_at__month', 'response__submitted_at__year')
            .annotate(prom=Avg('value'))
            .order_by('response__submitted_at__year', 'response__submitted_at__month')
        )
        historico_labels = [f"{h['response__submitted_at__month']}/{h['response__submitted_at__year']}" for h in historico]
        historico_data = [round(h['prom'] or 0, 2) for h in historico]

        return Response({
            'promedio_general': promedio_general,
            'promedios_dimensiones': promedios_dim,
            'recomendacion_general': recomendacion_general,
            'recomendaciones_dimensiones': recomendaciones_dim,
            'radar_labels': radar_labels,
            'radar_data': radar_data,
            'historico_labels': historico_labels,
            'historico_data': historico_data,
        })

class ExportSurveyAllDataView(APIView):
    """Exporta los resultados de encuestas de todas las empresas en CSV o Excel, con hoja/archivo por empresa y fila de promedios."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Solo admins pueden exportar todo
        if not request.user.is_superuser:
            return Response({'error': 'No autorizado'}, status=403)
        from employees.models import Company
        questions = list(Question.objects.all().order_by('order'))
        question_headers = [f'Pregunta {q.order}' for q in questions]
        empresas = Company.objects.all()
        temp_files = []
        if request.query_params.get('format', 'csv') == 'excel':
            with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
                writer = pd.ExcelWriter(tmp.name, engine='openpyxl')
                for empresa in empresas:
                    empleados = Employee.objects.filter(company=empresa)
                    responses = SurveyResponse.objects.filter(employee__in=empleados).order_by('submitted_at')
                    data = []
                    for resp in responses:
                        answers_dict = {a.question_id: a.value for a in resp.answers.all()}
                        row = [resp.submitted_at.strftime('%Y-%m-%d')]
                        for q in questions:
                            row.append(answers_dict.get(q.id, ''))
                        data.append(row)
                    df = pd.DataFrame(data, columns=['Fecha'] + question_headers)
                    # Fila de promedios (solo columnas de preguntas)
                    if not df.empty:
                        promedios = ['Promedio'] + [df[q].astype(float).mean(skipna=True) for q in question_headers]
                        df.loc[len(df)] = promedios
                    # Nombre limpio para la hoja
                    sheet_name = slugify(empresa.name)[:31] or f'empresa_{empresa.id}'
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
                writer.close()
                tmp.seek(0)
                response = FileResponse(open(tmp.name, 'rb'), as_attachment=True, filename='synergia_export.xlsx')
                temp_files.append(tmp.name)
                return response
        else:  # CSV
            # Un archivo zip con un CSV por empresa
            import zipfile
            with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as zip_tmp:
                with zipfile.ZipFile(zip_tmp, 'w') as zipf:
                    for empresa in empresas:
                        empleados = Employee.objects.filter(company=empresa)
                        responses = SurveyResponse.objects.filter(employee__in=empleados).order_by('submitted_at')
                        data = []
                        for resp in responses:
                            answers_dict = {a.question_id: a.value for a in resp.answers.all()}
                            row = [resp.submitted_at.strftime('%Y-%m-%d')]
                            for q in questions:
                                row.append(answers_dict.get(q.id, ''))
                            data.append(row)
                        df = pd.DataFrame(data, columns=['Fecha'] + question_headers)
                        # Fila de promedios
                        if not df.empty:
                            promedios = ['Promedio'] + [df[q].astype(float).mean(skipna=True) for q in question_headers]
                            df.loc[len(df)] = promedios
                        # Guardar CSV temporal
                        csv_tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.csv')
                        df.to_csv(csv_tmp.name, index=False, encoding='utf-8-sig')
                        csv_tmp.close()
                        # Nombre limpio para el archivo
                        csv_name = slugify(empresa.name) or f'empresa_{empresa.id}'
                        zipf.write(csv_tmp.name, arcname=f'{csv_name}.csv')
                        temp_files.append(csv_tmp.name)
                zip_tmp.seek(0)
                response = FileResponse(open(zip_tmp.name, 'rb'), as_attachment=True, filename='synergia_export.zip')
                temp_files.append(zip_tmp.name)
                return response
        # Limpieza de archivos temporales (opcional, depende del servidor)
        for f in temp_files:
            try:
                os.remove(f)
            except Exception:
                pass
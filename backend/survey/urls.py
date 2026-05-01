from django.urls import path
from .views import DimensionListAPIView, SurveyResponseCreateAPIView, GenerateAccessCodeView, ListAccessCodesByEmployeeView, ValidateAccessCodeView, SurveyStatisticsView, ExportSurveyDataView, SurveyAnalysisView, SurveyRecommendationsView

urlpatterns = [
    path('dimensions/', DimensionListAPIView.as_view(), name='dimension-list'),
    path('submit/', SurveyResponseCreateAPIView.as_view(), name='submit-response'),
    
    path('code/generate/', GenerateAccessCodeView.as_view(), name='generate-access-code'),
    path('code/list/<int:employee_id>/', ListAccessCodesByEmployeeView.as_view(), name='list-access-codes'),
    path('code/validate/', ValidateAccessCodeView.as_view(), name='validate-access-code'),
    
    path('statistics/<int:empresa_id>/', SurveyStatisticsView.as_view(), name='survey-statistics'),
    path('export/', ExportSurveyDataView.as_view(), name='export-survey-data'),
    path('analysis/', SurveyAnalysisView.as_view(), name='analyze-survey-data'),
    path('recommendations/', SurveyRecommendationsView.as_view(), name='survey-recommendations'),
]

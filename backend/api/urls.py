from django.urls import path
from .views import RegisterUserView, UserProfileView, ChangePasswordView, ForgotPasswordView
from .admin_views import AdminCompaniesAPIView, AdminExportAllSurveysAPIView, AdminCompanyDetailAPIView


urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    # Endpoints de administración global
    path('admin/companies/', AdminCompaniesAPIView.as_view(), name='admin_companies'),
    path('admin/companies/<int:company_id>/', AdminCompanyDetailAPIView.as_view(), name='admin_company_detail'),
    path('admin/export/', AdminExportAllSurveysAPIView.as_view(), name='admin_export_all_surveys'),
]

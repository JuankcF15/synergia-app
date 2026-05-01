from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

# Definición de las rutas principales del proyecto
urlpatterns = [
    # Ruta para acceder al panel de administración de Django
    path('admin/', admin.site.urls),

    # Ruta para obtener un token de acceso y de actualización (JWT)
    # Este endpoint es proporcionado por SimpleJWT
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),

    # Ruta para refrescar el token de acceso usando el token de actualización
    # Este endpoint también es proporcionado por SimpleJWT
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),

    # Ruta para incluir las URLs de autenticación de Django REST Framework
    # Esto permite usar las vistas de inicio de sesión y cierre de sesión predeterminadas de DRF
    path('api-auth/', include('rest_framework.urls')),

    # Ruta para incluir las URLs definidas en la aplicación "api"
    # Esto permite que las rutas de la aplicación "api" estén disponibles bajo el prefijo "/api/"
    path('api/', include('api.urls')),
    
    path('api/employees/', include('employees.urls')),  # Rutas de empleados
    path('api/survey/', include('survey.urls')),  # Rutas de encuestas
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
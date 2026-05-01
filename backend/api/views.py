from rest_framework import generics
from .serializers import RegisterUserSerializer, BusinessSerializer, ChangePasswordSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Business
from django.contrib.auth import authenticate
from django.core.mail import send_mail
import string
import random


class RegisterUserView(generics.CreateAPIView):
    """ View to register a new user."""
    queryset = User.objects.all()
    serializer_class = RegisterUserSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  

class UserProfileView(APIView):
    """ View to handle user profile operations, including retrieving and updating the business profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """ Retrieve the business profile of the authenticated user, incluyendo si es superuser."""
        user = request.user
        try:
            business = user.business  # Relación OneToOne con el modelo Business
            serializer = BusinessSerializer(business, context={'request': request})  # Pasar el contexto para la URL de la imagen
            data = serializer.data
        except Business.DoesNotExist:
            data = {}
        # Añadir info de superuser
        data['is_superuser'] = user.is_superuser
        data['email'] = user.email
        data['username'] = user.username
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        return Response(data, status=200)
    
    def patch(self, request):
        """ Update the business profile of the authenticated user."""
        user = request.user
        try:
            business = user.business
            # Handle image upload separately if it's in the request
            if 'img' in request.FILES:
                business.img = request.FILES['img']
                business.save()
                
            serializer = BusinessSerializer(business, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)
        except Business.DoesNotExist:
            return Response({"error": "El usuario no tiene un perfil de empresa asociado."}, status=404)

class ChangePasswordView(APIView):
    """ View to handle changing the user's password."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'La contraseña actual es incorrecta.'},
                    status=400
                )
            
            # Cambiar la contraseña
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {'message': 'Contraseña actualizada correctamente.'},
                status=200
            )
        return Response(serializer.errors, status=400)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'El correo es requerido.'}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No existe un usuario con ese correo.'}, status=404)
        # Generar nueva contraseña aleatoria
        new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        user.set_password(new_password)
        user.save()
        # Enviar correo
        send_mail(
            'Recuperación de contraseña - Synergia',
            f'Su nueva contraseña temporal es: {new_password}\nPor favor, cámbiela después de iniciar sesión.',
            None,  # Usa DEFAULT_FROM_EMAIL
            [email],
            fail_silently=False,
        )
        return Response({'message': 'Se ha enviado una nueva contraseña a su correo.'}, status=200)
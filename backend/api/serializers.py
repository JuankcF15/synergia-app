from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from .models import Business

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """  Serializer for the User model, excluding password and sensitive fields."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class BusinessSerializer(serializers.ModelSerializer):
    """ Serializer for the Business model, including a method to return the full URL of the image."""
    img = serializers.SerializerMethodField()  # Agregar un método para construir la URL completa

    class Meta:
        model = Business
        exclude = ['user']

    def get_img(self, obj):
        """ Method to return the full URL of the image field."""
        request = self.context.get('request')
        if obj.img:
            return request.build_absolute_uri(obj.img.url)
        return None

class RegisterUserSerializer(serializers.ModelSerializer):
    """ Serializer for user registration, including nested Business serializer."""
    business = BusinessSerializer()
    class Meta:
        model = User
        fields = ['email', 'password', 'business']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        """ Create a new user and associated business profile."""
        business_data = validated_data.pop('business')
        validated_data['username'] = validated_data['email']  # email como username
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        Business.objects.create(user=user, **business_data)
        return user

class ChangePasswordSerializer(serializers.Serializer):
    """ Serializer for changing user password."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password2 = serializers.CharField(required=True, min_length=8)

    def validate(self, data):
        """ Validate that the new passwords match and meet criteria."""
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({
                'new_password2': 'Las contraseñas no coinciden.'
            })
        return data
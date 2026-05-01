from rest_framework import serializers
from .models import Dimension, Question, SurveyResponse, Answer, AccessCode

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'order']

class DimensionSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Dimension
        fields = ['id', 'name', 'questions']

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['question', 'value']

class SurveyResponseSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)
    employee = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = SurveyResponse
        fields = ['id', 'employee', 'answers']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        response = SurveyResponse.objects.create(**validated_data)
        for answer_data in answers_data:
            Answer.objects.create(response=response, **answer_data)
        return response

class AccessCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessCode
        fields = ['id', 'code', 'employee', 'used', 'created_at']
        read_only_fields = ['code', 'used', 'created_at']

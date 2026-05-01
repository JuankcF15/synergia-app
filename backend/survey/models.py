from django.db import models
from employees.models import Employee  # ajustá si tu modelo Employee está en otro lugar

class Dimension(models.Model):
    name = models.CharField(max_length=100)


class Question(models.Model):
    dimension = models.ForeignKey(Dimension, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.PositiveIntegerField()


class SurveyResponse(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='survey_responses')
    submitted_at = models.DateTimeField(auto_now_add=True)


class Answer(models.Model):
    response = models.ForeignKey(SurveyResponse, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    value = models.IntegerField()  # escala Likert 1 a 5

class AccessCode(models.Model):
    code = models.CharField(max_length=12, unique=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='access_codes')
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
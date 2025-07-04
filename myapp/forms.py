from django import forms
from django.contrib.auth.models import Teacher
from django.contrib.auth.forms import UserCreationForm

class RegisterForm(UserCreationForm):
    class Meta:
        model = Teacher
        fields = ['username', 'password']

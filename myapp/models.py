from django.db import models

# Create your models here.

from django.db import models

class Teacher(models.Model):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=50)

class Student(models.Model):
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    marks = models.IntegerField()

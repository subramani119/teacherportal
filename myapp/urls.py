from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('home/', views.home, name='home'),
    path('create-add-student/', views.create_or_add_student, name='create_or_add_student'),
    path('delete-student/<int:id>/', views.deleteStudent, name='delete_student'),
    path('update-student/<int:id>/', views.update_student, name='update'),
    path('logout/', views.logout_view, name='logout'),
]

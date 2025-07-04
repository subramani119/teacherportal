from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('home/', views.home, name='home'),
    path('add/', views.add_student, name='add'),
    path('delete/<int:id>/', views.delete_student, name='delete'),
    path('update/<int:id>/', views.update_student, name='update'),
    path('logout/', views.logout_view, name='logout'),
]

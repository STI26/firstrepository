from django.urls import path

from . import views

urlpatterns = [
    path('repairs/', views.repairs, name='repairs'),
]

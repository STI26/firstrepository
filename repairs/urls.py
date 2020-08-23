from django.urls import path

from . import views

urlpatterns = [
    path('', views.repairs, name='repairs'),
    # path('db/', views.clondb, name='clondb'),
]

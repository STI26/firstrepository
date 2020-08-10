from django.urls import path
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login_view',),
    path('login/contexts', views.contexts, name='contexts',),
    path('logout/', auth_views.LogoutView.as_view(), name='logout_view',),
]

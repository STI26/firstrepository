from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout


@login_required
def index(request):
    return render(request, 'dashboard/index.html')


def login_view(request):
    return render(request, 'dashboard/login.html')


def logout_view(request):
    logout(request)
    return redirect('login_view')

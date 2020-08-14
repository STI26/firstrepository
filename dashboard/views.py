from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from dashboard.libs.ldap import LDAPContext
import logging
import datetime as dt

# Get an instance of a logger
log = logging.getLogger(__name__)


@login_required
def index(request):
    return render(request, 'dashboard/index.html')


def login_view(request):
    """Log user in"""

    # Forget any user ID
    logout(request)

    if request.method == 'POST':

        # Get data received in ajax request
        username = request.POST['username']
        password = request.POST['password']
        context = request.POST.get('context', '')

        user = authenticate(request,
                            username=username,
                            password=password,
                            context=context)
        if user is not None:
            login(request, user)
            log.info(f'---Login: {user.username} - {dt.datetime.now()}')
            return redirect('index')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль')
            return redirect('login_view')

    else:
        return render(request, 'registration/login.html')


def logout_view(request):
    logout(request)
    return redirect('login_view')


def contexts(request):
    """Load contexts"""

    with LDAPContext() as c:
        contexts = c.getContexts(attr=['description'])

    return JsonResponse(contexts, safe=False)

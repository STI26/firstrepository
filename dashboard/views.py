from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.http import require_POST
from dashboard.libs.ldap import LDAPContext
from dashboard.libs.charts import Charts
import logging
import json
import datetime as dt

# Get an instance of a logger
log = logging.getLogger(__name__)


@login_required
def index(request):

    if request.method == 'POST':
        # Create class Charts
        toners = Charts()

        # Get action name
        operation = request.headers.get('operation')

        # Get data received in ajax request
        data = json.loads(request.body)

        # Run current operation
        result = toners.action(operation, data)

        return JsonResponse(result, safe=False)
    else:
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

        if context:
            # Check the connection to remote server
            try:
                with LDAPContext():
                    pass
            except TypeError:
                messages.error(request, 'LDAP сервер не доступен.')
                return redirect('login_view')

        user = authenticate(request,
                            username=username,
                            password=password,
                            context=context, )
        if user is not None:
            login(request, user)
            log.info(f'---AUTHENTICATION_BACKENDS: {user.backend}')
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


def browser_not_supported(request):
    if request.method == 'GET':
        return render(request, 'dashboard/browsernotsupported.html')


@require_POST
def contexts(request):
    """Load contexts"""

    try:
        with LDAPContext() as c:
            contexts = c.getContexts(attr=['description'])
    except TypeError:
        data = {'status': False,
                'message': 'Невозможно загрузить контексты.'}
    else:
        data = {'status': True,
                'contexts': contexts}

    return JsonResponse(data, safe=False)

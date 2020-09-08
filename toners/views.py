from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from toners.libs.toners import DataToners
import json


@login_required
def toners(request):

    if request.method == 'POST':
        # Create class DataToners
        toners = DataToners()

        # Get action name
        operation = request.headers.get('operation')

        # Get data received in ajax request
        data = json.loads(request.body)

        # Run current operation
        result = toners.action(operation, request.user, data)

        return JsonResponse(result, safe=False)
    # If method 'GET'
    else:
        return render(request, 'toners/toners.html')

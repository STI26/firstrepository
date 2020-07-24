from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required()
def repairs(request):

    return render(request, 'repairs/repairs.html')

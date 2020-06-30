from django.shortcuts import render
from django.http import HttpResponse


def repairs(request):
    return HttpResponse("the repairs page.")

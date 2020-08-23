from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def toners(request):

    if request.method == 'POST':
        pass
    # If method 'GET'
    else:
        return render(request, 'toners/toners.html')

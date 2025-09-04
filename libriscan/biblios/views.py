from django.shortcuts import render


def index(request):
    context = {"app_name": "Libriscan"}
    return render(request, "biblios/index.html", context)
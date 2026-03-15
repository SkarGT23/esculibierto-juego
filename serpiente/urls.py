"""
URL configuration for serpiente project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from juego import views
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),  # tu página principal
    path('juego/', include('juego.urls')),  # si tienes más rutas internas en juego/urls.py
]

# Servir archivos estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Servir archivos PWA desde la carpeta 'static/pwa' de la app
if settings.DEBUG and hasattr(settings, 'STATICFILES_DIRS') and settings.STATICFILES_DIRS:
    urlpatterns += static('/pwa/', document_root=os.path.join(settings.STATICFILES_DIRS[0], 'pwa'))
    urlpatterns += static('/static/pwa/', document_root=os.path.join(settings.STATICFILES_DIRS[0], 'pwa'))
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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('juego.urls')),
]

# Servir archivos estáticos normales como siempre
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Servir archivos PWA desde la carpeta 'static' de la app sin tocar la web
if settings.DEBUG and hasattr(settings, 'STATICFILES_DIRS') and settings.STATICFILES_DIRS:
    urlpatterns += static('/pwa/', document_root=settings.STATICFILES_DIRS[0] + '/pwa')

# Servir archivos PWA desde static/pwa sin interferir con la web
if settings.DEBUG and hasattr(settings, 'STATICFILES_DIRS') and settings.STATICFILES_DIRS:
    import os
    from django.conf.urls.static import static
    urlpatterns += static('/static/pwa/', document_root=os.path.join(settings.STATICFILES_DIRS[0], 'pwa'))
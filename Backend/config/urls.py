"""
URL configuration for config project.

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
from rest_framework.routers import DefaultRouter

from clinics.views import HospitalViewSet
from geography.views import AddressCityDistrictViewSet, EDCHexa500x500ViewSet
from population.views import GridsPopulationViewSet

router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet)
router.register(r'address-city-districts', AddressCityDistrictViewSet)
router.register(r'grids-population', GridsPopulationViewSet)
router.register(r'edc-hexa-500x500', EDCHexa500x500ViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

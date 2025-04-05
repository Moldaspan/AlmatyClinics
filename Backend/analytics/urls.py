from django.urls import path
from .views import DistrictAnalyticsView

urlpatterns = [
    path('district-stats/', DistrictAnalyticsView.as_view(), name='district-stats'),
]
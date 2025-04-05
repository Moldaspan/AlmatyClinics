from django.urls import path
from .views import DistrictAnalyticsView, AgeStructureAnalyticsView, HighDemandZonesView

urlpatterns = [
    path('district-stats/', DistrictAnalyticsView.as_view(), name='district-stats'),
    path('age-structure/', AgeStructureAnalyticsView.as_view(), name='age-structure'),
    path("high-demand-zones/", HighDemandZonesView.as_view()),
]
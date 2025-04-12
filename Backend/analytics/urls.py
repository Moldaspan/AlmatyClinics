from django.urls import path
from .views import DistrictAnalyticsView, AgeStructureAnalyticsView, HighDemandZonesView, nearest_hospitals, \
    clinic_summary, route_to_hospital

urlpatterns = [
    path('district-stats/', DistrictAnalyticsView.as_view(), name='district-stats'),
    path('age-structure/', AgeStructureAnalyticsView.as_view(), name='age-structure'),
    path("high-demand-zones/", HighDemandZonesView.as_view()),
    path("nearest-hospitals/", nearest_hospitals),
    path("clinic-summary/", clinic_summary),
    path("route-to-hospital/", route_to_hospital),
]
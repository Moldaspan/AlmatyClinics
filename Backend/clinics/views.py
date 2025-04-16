from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Hospital
from .serializers import HospitalSerializer


class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['city']  # 'district' фильтруем вручную
    ordering_fields = ['name']
    search_fields = ['name', 'categories', 'address', 'description']

    def get_queryset(self):
        queryset = super().get_queryset()
        district = self.request.query_params.get("district")

        if district:
            district_cleaned = district.replace(" район", "").strip().lower()
            queryset = queryset.filter(district__icontains=district_cleaned)

        return queryset

    @action(detail=False, methods=["get"], url_path="districts")
    def list_districts(self, request):
        districts = (
            Hospital.objects.exclude(district__isnull=True)
            .exclude(district="")
            .values_list("district", flat=True)
            .distinct()
        )
        return Response(sorted(districts))

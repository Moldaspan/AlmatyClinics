from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Hospital
from .serializers import HospitalSerializer

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]

    # Поля, по которым доступна фильтрация
    filterset_fields = ['city', 'district', 'microdistrict', 'rating']

    # Поля, по которым доступна сортировка
    ordering_fields = ['name', 'rating', 'review_count']

    # Поля, по которым доступен поиск
    search_fields = ['name', 'categories', 'address', 'description']
from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GridsPopulation
from .serializers import PopulationGridSerializer

class GridsPopulationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GridsPopulation.objects.all()
    serializer_class = PopulationGridSerializer

    @action(detail=False, methods=['get'], url_path='population-by-region')
    def population_by_region(self, request):
        data = (
            GridsPopulation.objects
            .filter(is_deleted=False)
            .values('name_region')
            .annotate(total_population=Sum('total_sum_population'))
            .order_by('name_region')
        )
        return Response(data)

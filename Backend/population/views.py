from rest_framework import viewsets
from .models import GridsPopulation
from .serializers import PopulationGridSerializer

class GridsPopulationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GridsPopulation.objects.all()
    serializer_class = PopulationGridSerializer
from rest_framework import viewsets
from .models import AddressCityDistrict, EDCHexa500x500
from .serializers import AddressCityDistrictSerializer, EDCHexa500x500Serializer

class AddressCityDistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AddressCityDistrict.objects.all()
    serializer_class = AddressCityDistrictSerializer

class EDCHexa500x500ViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EDCHexa500x500.objects.all()
    serializer_class = EDCHexa500x500Serializer
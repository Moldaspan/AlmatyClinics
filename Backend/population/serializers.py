from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import GridsPopulation

class PopulationGridSerializer(serializers.ModelSerializer):
    class Meta:
        model = GridsPopulation
        fields = '__all__'
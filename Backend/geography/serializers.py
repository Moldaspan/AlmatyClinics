from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import AddressCityDistrict, EDCHexa500x500


class AddressCityDistrictSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = AddressCityDistrict
        geo_field = "geometry"
        fields = '__all__'


class EDCHexa500x500Serializer(GeoFeatureModelSerializer):
    class Meta:
        model = EDCHexa500x500
        geo_field = "geom"
        fields = '__all__'
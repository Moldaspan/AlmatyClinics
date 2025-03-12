from django.contrib.gis.db import models

class AddressCityDistrict(models.Model):
    id = models.BigAutoField(primary_key=True)
    name_kz = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255)
    response_name_kz = models.CharField(max_length=255)
    response_name_ru = models.CharField(max_length=255)
    gerb_img = models.CharField(max_length=255, blank=True, null=True)
    geometry = models.GeometryField()
    marker = models.GeometryField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    city_id = models.BigIntegerField()
    akim_id = models.IntegerField()

    class Meta:
        db_table = "address_city_districts"

class EDCHexa500x500(models.Model):
    id = models.AutoField(primary_key=True)
    left = models.FloatField()
    top = models.FloatField()
    right = models.FloatField()
    bottom = models.FloatField()
    geom = models.GeometryField()

    class Meta:
        db_table = "edc_hexa_500x500"
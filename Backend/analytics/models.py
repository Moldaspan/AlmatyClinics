from django.contrib.gis.db import models

class CachedHighDemandZone(models.Model):
    x = models.FloatField()
    y = models.FloatField()
    population = models.IntegerField()
    district = models.CharField(max_length=255)
    priority = models.CharField(max_length=20)
    distance_km = models.FloatField()
    geometry = models.GeometryField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cached_high_demand_zones"

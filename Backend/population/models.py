from django.contrib.gis.db import models

class GridsPopulation(models.Model):
    id = models.BigAutoField(primary_key=True)
    name_region = models.CharField(max_length=255)
    note = models.TextField()
    grid_id = models.IntegerField()
    x = models.FloatField()
    y = models.FloatField()
    f0_14 = models.IntegerField()
    f15_25 = models.IntegerField()
    f26_35 = models.IntegerField()
    f36_45 = models.IntegerField()
    f46_55 = models.IntegerField()
    f56_65 = models.IntegerField()
    f66 = models.IntegerField()
    total_sum_population = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    is_deleted = models.BooleanField()
    geometry = models.GeometryField()
    name_region_kz = models.CharField(max_length=255)

    class Meta:
        db_table = "grids_population"

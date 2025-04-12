from celery import shared_task
from django.contrib.gis.geos import Point
from clinics.models import Hospital
from population.models import GridsPopulation
from geography.models import AddressCityDistrict
from .models import CachedHighDemandZone

@shared_task
def calculate_high_demand_zones():
    threshold_population = 1500
    distance_km = 1.0

    hospitals = list(Hospital.objects.values_list("x", "y"))
    districts = list(AddressCityDistrict.objects.all())

    def get_district_name(point):
        for district in districts:
            if district.geometry.contains(point):
                return district.name_ru
        return "Неизвестный район"

    CachedHighDemandZone.objects.all().delete()

    grids = GridsPopulation.objects.filter(
        is_deleted=False,
        total_sum_population__gte=threshold_population
    )

    new_zones = []

    for grid in grids:
        point = grid.geometry.centroid
        min_dist = min([
            Point(hx, hy).distance(point) * 111
            for hx, hy in hospitals if hx and hy
        ], default=None)

        if min_dist is None or min_dist < 0.5:
            continue

        if min_dist >= 1.5:
            priority = "critical"
        elif min_dist >= 1.0:
            priority = "moderate"
        else:
            priority = "low"

        zone = CachedHighDemandZone(
            x=grid.x,
            y=grid.y,
            population=grid.total_sum_population,
            district=get_district_name(point),
            priority=priority,
            distance_km=round(min_dist, 2),
            geometry=grid.geometry
        )
        new_zones.append(zone)

    CachedHighDemandZone.objects.bulk_create(new_zones)

import requests
from collections import defaultdict
from django.db.models import Sum
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from clinics.models import Hospital
from population.models import GridsPopulation
from django.contrib.gis.geos import Point
from geography.models import AddressCityDistrict
from django.db.models import Count
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from .models import CachedHighDemandZone
import pandas as pd
from django.http import HttpResponse
from django.db.models import Sum
from collections import defaultdict

@method_decorator(cache_page(60 * 15), name='dispatch')
class DistrictAnalyticsView(APIView):
    def get(self, request):
        # Собираем население по районам
        population_data = (
            GridsPopulation.objects
            .filter(is_deleted=False)
            .values('name_region')
            .annotate(total_population=Sum('total_sum_population'))
        )
        population_by_region = {entry['name_region']: entry['total_population'] for entry in population_data}

        # Собираем клиники по районам
        hospital_data = (
            Hospital.objects
            .values('district')
        )
        clinic_count_by_region = defaultdict(int)
        for hospital in hospital_data:
            name = hospital['district']
            if name:
                clinic_count_by_region[name] += 1

        # Собираем всё вместе
        result = []
        for district, population in population_by_region.items():
            clinics = clinic_count_by_region.get(district, 0)
            if clinics > 0:
                ppl_per_clinic = round(population / clinics)
            else:
                ppl_per_clinic = None

            status_value = "overloaded" if ppl_per_clinic and ppl_per_clinic > 15000 else "normal"

            result.append({
                "district": district,
                "population": population,
                "clinic_count": clinics,
                "population_per_clinic": ppl_per_clinic,
                "status": status_value
            })

        return Response(result, status=status.HTTP_200_OK)


@method_decorator(cache_page(60 * 15), name='dispatch')
class AgeStructureAnalyticsView(APIView):
    def get(self, request):
        district = request.query_params.get("district")

        queryset = GridsPopulation.objects.filter(is_deleted=False)

        if district and district != "Все районы":
            queryset = queryset.filter(name_region=district)

        data = queryset.aggregate(
            f0_14=Sum("f0_14"),
            f15_25=Sum("f15_25"),
            f26_35=Sum("f26_35"),
            f36_45=Sum("f36_45"),
            f46_55=Sum("f46_55"),
            f56_65=Sum("f56_65"),
            f66=Sum("f66"),
        )

        return Response(data, status=status.HTTP_200_OK)


@method_decorator(cache_page(60 * 15), name='dispatch')
class HighDemandZonesView(APIView):
    def get(self, request):
        zones = CachedHighDemandZone.objects.all()
        data = [
            {
                "x": z.x,
                "y": z.y,
                "population": z.population,
                "district": z.district,
                "priority": z.priority,
                "distance_km": z.distance_km,
                "geometry": z.geometry.geojson,
                "updated_at": z.updated_at,
            }
            for z in zones
        ]
        return Response(data)

@cache_page(60 * 15)
@api_view(['GET'])
def nearest_hospitals(request):
    try:
        lat = float(request.query_params.get('lat'))
        lon = float(request.query_params.get('lon'))
    except (TypeError, ValueError):
        return Response({"error": "Invalid or missing lat/lon parameters"}, status=status.HTTP_400_BAD_REQUEST)

    user_location = Point(lon, lat, srid=4326)

    # Базовый queryset
    hospitals = Hospital.objects.exclude(x__isnull=True).exclude(y__isnull=True)

    #Фильтрация по району
    district = request.query_params.get("district")
    if district:
        hospitals = hospitals.filter(district__icontains=district)

    #Фильтрация по ключевому слову в специализации
    category = request.query_params.get("category")
    if category:
        hospitals = hospitals.filter(categories__icontains=category)

    results = []
    for h in hospitals:
        hosp_point = Point(h.x, h.y, srid=4326)
        distance_km = user_location.distance(hosp_point) * 111

        results.append({
            "name": h.name,
            "address": h.address,
            "district": h.district,
            "distance_km": round(distance_km, 2),
            "phone": h.phone_1,
            "website": h.website_1,
            "categories": h.categories,
        })

    sorted_results = sorted(results, key=lambda x: x["distance_km"])[:5]

    return Response(sorted_results, status=status.HTTP_200_OK)

@cache_page(60 * 15)
@api_view(['GET'])
def clinic_summary(request):
    hospitals = Hospital.objects.exclude(district__isnull=True).exclude(district="")

    total_clinics = hospitals.count()

    clinics_by_district = (
        hospitals
        .values('district')
        .annotate(count=Count('name'))
        .order_by('-count')
    )

    districts_covered = clinics_by_district.count()

    if clinics_by_district:
        max_district = clinics_by_district[0]
        min_district = clinics_by_district.last()
        avg = total_clinics / districts_covered if districts_covered else 0
    else:
        max_district = {"district": None, "count": 0}
        min_district = {"district": None, "count": 0}
        avg = 0

    return Response({
        "total_clinics": total_clinics,
        "districts_covered": districts_covered,
        "average_clinics_per_district": round(avg, 2),
        "max_clinic_district": max_district['district'],
        "min_clinic_district": min_district['district']
    })

@cache_page(60 * 15)
@api_view(['GET'])
def route_to_hospital(request):
    try:
        user_lat = float(request.query_params.get("lat"))
        user_lon = float(request.query_params.get("lon"))
        hospital_name = request.query_params.get("hospital_name")
    except (ValueError, TypeError):
        return Response({"error": "Missing or invalid parameters"}, status=400)

    try:
        hospital = Hospital.objects.get(name=hospital_name)
        if hospital.x is None or hospital.y is None:
            return Response({"error": "Hospital coordinates missing"}, status=400)
    except Hospital.DoesNotExist:
        return Response({"error": "Hospital not found"}, status=404)

    # OSRM API (можно заменить на свой локальный сервер или Mapbox)
    url = f"http://router.project-osrm.org/route/v1/driving/{user_lon},{user_lat};{hospital.x},{hospital.y}?overview=full&geometries=geojson"

    res = requests.get(url)
    if res.status_code != 200:
        return Response({"error": "Failed to fetch route"}, status=500)

    route_data = res.json()
    route = route_data["routes"][0]

    return Response({
        "hospital": hospital.name,
        "distance_km": round(route["distance"] / 1000, 2),
        "duration_min": round(route["duration"] / 60, 1),
        "route_geometry": route["geometry"]
    })


@api_view(['GET'])
def export_district_stats_excel(request):
    # Собираем данные как в district-stats
    population_data = (
        GridsPopulation.objects
        .filter(is_deleted=False)
        .values('name_region')
        .annotate(total_population=Sum('total_sum_population'))
    )
    population_by_region = {entry['name_region']: entry['total_population'] for entry in population_data}

    hospital_data = Hospital.objects.values('district')
    clinic_count_by_region = defaultdict(int)
    for hospital in hospital_data:
        name = hospital['district']
        if name:
            clinic_count_by_region[name] += 1

    export_data = []
    for district, population in population_by_region.items():
        clinics = clinic_count_by_region.get(district, 0)
        ppl_per_clinic = round(population / clinics) if clinics > 0 else None

        if ppl_per_clinic is None:
            status = "no clinics"
        elif ppl_per_clinic > 20000:
            status = "critical"
        elif ppl_per_clinic > 15000:
            status = "warning"
        else:
            status = "normal"

        export_data.append({
            "Район": district,
            "Население": population,
            "Клиник": clinics,
            "Чел. на 1 клинику": ppl_per_clinic,
            "Статус": status
        })

    df = pd.DataFrame(export_data)

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=district_stats.xlsx'
    df.to_excel(response, index=False, engine='openpyxl')

    return response

@api_view(['GET'])
def export_hospitals_excel(request):
    hospitals = Hospital.objects.all()

    export_data = []

    for h in hospitals:
        export_data.append({
            "Название": h.name,
            "Район": h.district,
            "Адрес": h.address,
            "Город": h.city,
            "Категории": h.categories,
            "Часы работы": h.working_hours,
            "Телефон": h.phone_1,
            "Веб-сайт": h.website_1,
            "Instagram": h.instagram,
            "X": h.x,
            "Y": h.y,
        })

    df = pd.DataFrame(export_data)

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=hospitals_list.xlsx'
    df.to_excel(response, index=False, engine='openpyxl')

    return response

@api_view(['GET'])
def export_high_demand_excel(request):
    zones = CachedHighDemandZone.objects.all()

    export_data = []

    for z in zones:
        export_data.append({
            "Район": z.district,
            "X": z.x,
            "Y": z.y,
            "Население": z.population,
            "Расстояние до ближайшей клиники (км)": z.distance_km,
            "Приоритет": z.priority,
            "Обновлено": z.updated_at,
        })

    df = pd.DataFrame(export_data)

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=high_demand_zones.xlsx'
    df.to_excel(response, index=False, engine='openpyxl')

    return response
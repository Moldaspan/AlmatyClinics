from collections import defaultdict
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from clinics.models import Hospital
from population.models import GridsPopulation


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
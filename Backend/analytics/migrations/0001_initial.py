# Generated by Django 5.1.7 on 2025-04-12 19:10

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CachedHighDemandZone',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('x', models.FloatField()),
                ('y', models.FloatField()),
                ('population', models.IntegerField()),
                ('district', models.CharField(max_length=255)),
                ('priority', models.CharField(max_length=20)),
                ('distance_km', models.FloatField()),
                ('geometry', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'cached_high_demand_zones',
            },
        ),
    ]

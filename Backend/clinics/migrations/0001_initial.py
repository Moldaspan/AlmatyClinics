# Generated by Django 5.1.7 on 2025-04-03 16:33

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Hospital',
            fields=[
                ('name', models.CharField(db_column='Наименование', max_length=255, primary_key=True, serialize=False)),
                ('description', models.TextField(blank=True, db_column='Описание', null=True)),
                ('categories', models.TextField(blank=True, db_column='Рубрики', null=True)),
                ('address', models.TextField(blank=True, db_column='Адрес', null=True)),
                ('address_comment', models.TextField(blank=True, db_column='Комментарий к адресу', null=True)),
                ('postal_code', models.BigIntegerField(blank=True, db_column='Почтовый индекс', null=True)),
                ('district', models.CharField(blank=True, db_column='Район', max_length=255, null=True)),
                ('city', models.CharField(blank=True, db_column='Город', max_length=255, null=True)),
                ('working_hours', models.CharField(blank=True, db_column='Часы работы', max_length=255, null=True)),
                ('phone_1', models.CharField(blank=True, db_column='Телефон 1', max_length=50, null=True)),
                ('phone_2', models.CharField(blank=True, db_column='Телефон 2', max_length=50, null=True)),
                ('phone_3', models.CharField(blank=True, db_column='Телефон 3', max_length=50, null=True)),
                ('email', models.EmailField(blank=True, db_column='E-mail', max_length=254, null=True)),
                ('website_1', models.URLField(blank=True, db_column='Веб-сайт 1', null=True)),
                ('instagram', models.URLField(blank=True, db_column='Instagram', null=True)),
                ('whatsapp', models.CharField(blank=True, db_column='WhatsApp', max_length=50, null=True)),
                ('y', models.FloatField(blank=True, db_column='Y', null=True)),
                ('x', models.FloatField(blank=True, db_column='X', null=True)),
                ('gis_url', models.URLField(blank=True, db_column='2GIS URL', null=True)),
            ],
            options={
                'db_table': 'hospitals',
                'managed': False,
            },
        ),
    ]

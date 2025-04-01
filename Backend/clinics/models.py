from django.db import models

class Hospital(models.Model):
    name = models.CharField(max_length=255, primary_key=True, db_column="Наименование")
    description = models.TextField(blank=True, null=True, db_column="Описание")
    categories = models.TextField(blank=True, null=True, db_column="Рубрики")
    address = models.TextField(blank=True, null=True, db_column="Адрес")
    address_comment = models.TextField(blank=True, null=True, db_column="Комментарий к адресу")
    postal_code = models.BigIntegerField(blank=True, null=True, db_column="Почтовый индекс")
    district = models.CharField(max_length=255, blank=True, null=True, db_column="Район")
    city = models.CharField(max_length=255, blank=True, null=True, db_column="Город")
    working_hours = models.CharField(max_length=255, blank=True, null=True, db_column="Часы работы")
    phone_1 = models.CharField(max_length=50, blank=True, null=True, db_column="Телефон 1")
    phone_2 = models.CharField(max_length=50, blank=True, null=True, db_column="Телефон 2")
    phone_3 = models.CharField(max_length=50, blank=True, null=True, db_column="Телефон 3")
    email = models.EmailField(blank=True, null=True, db_column="E-mail")
    website_1 = models.URLField(blank=True, null=True, db_column="Веб-сайт 1")
    instagram = models.URLField(blank=True, null=True, db_column="Instagram")
    whatsapp = models.CharField(max_length=50, blank=True, null=True, db_column="WhatsApp")
    y = models.FloatField(blank=True, null=True, db_column="Y")
    x = models.FloatField(blank=True, null=True, db_column="X")
    gis_url = models.URLField(blank=True, null=True, db_column="2GIS URL")

    class Meta:
        db_table = "hospitals"
        managed = False
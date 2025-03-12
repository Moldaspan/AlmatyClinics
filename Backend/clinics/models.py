from django.db import models

class Hospital(models.Model):
    name = models.CharField(max_length=255, primary_key=True, db_column="Наименование")
    description = models.TextField(blank=True, null=True, db_column="Описание")
    categories = models.TextField(blank=True, null=True, db_column="Рубрики")
    address = models.TextField(blank=True, null=True, db_column="Адрес")
    address_comment = models.TextField(blank=True, null=True, db_column="Комментарий к адресу")
    postal_code = models.BigIntegerField(blank=True, null=True, db_column="Почтовый индекс")
    microdistrict = models.CharField(max_length=255, blank=True, null=True, db_column="Микрорайон")
    district = models.CharField(max_length=255, blank=True, null=True, db_column="Район")
    city = models.CharField(max_length=255, blank=True, null=True, db_column="Город")
    working_hours = models.CharField(max_length=255, blank=True, null=True, db_column="Часы работы")
    rating = models.CharField(max_length=50, blank=True, null=True, db_column="Рейтинг")
    review_count = models.CharField(max_length=50, blank=True, null=True, db_column="Количество отзывов")
    phone_1 = models.CharField(max_length=50, blank=True, null=True, db_column="Телефон 1")
    phone_2 = models.CharField(max_length=50, blank=True, null=True, db_column="Телефон 2")
    phone_3 = models.CharField(max_length=50, blank=True, null=True, db_column="Телефон 3")
    email_1 = models.EmailField(blank=True, null=True, db_column="E-mail 1")
    website_1 = models.URLField(blank=True, null=True, db_column="Веб-сайт 1")
    instagram = models.URLField(blank=True, null=True, db_column="Instagram")
    twitter = models.URLField(blank=True, null=True, db_column="Twitter")
    facebook = models.URLField(blank=True, null=True, db_column="Facebook")
    whatsapp_1 = models.CharField(max_length=50, blank=True, null=True, db_column="WhatsApp 1")
    whatsapp_2 = models.CharField(max_length=50, blank=True, null=True, db_column="WhatsApp 2")
    whatsapp_3 = models.CharField(max_length=50, blank=True, null=True, db_column="WhatsApp 3")
    telegram_1 = models.CharField(max_length=50, blank=True, null=True, db_column="Telegram 1")
    telegram_2 = models.CharField(max_length=50, blank=True, null=True, db_column="Telegram 2")
    youtube = models.URLField(blank=True, null=True, db_column="YouTube")
    y = models.FloatField(blank=True, null=True, db_column="Y")
    x = models.FloatField(blank=True, null=True, db_column="X")
    gis_url = models.URLField(blank=True, null=True, db_column="2GIS URL")

    class Meta:
        db_table = "hospitals"
        managed = False
# Generated by Django 3.0.7 on 2020-10-17 16:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('toners', '0005_auto_20201017_1251'),
    ]

    operations = [
        migrations.AddField(
            model_name='statuses',
            name='link_printer',
            field=models.BooleanField(default=False),
        ),
    ]

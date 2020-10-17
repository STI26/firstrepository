# Generated by Django 3.0.7 on 2020-10-17 12:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('repairs', '0018_auto_20200826_1458'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='brands',
            options={'ordering': ['name'], 'verbose_name': 'Брэнд', 'verbose_name_plural': 'Брэнды'},
        ),
        migrations.AlterModelOptions(
            name='buildings',
            options={'ordering': ['name'], 'verbose_name': 'Филиал', 'verbose_name_plural': 'Филиалы'},
        ),
        migrations.AlterModelOptions(
            name='departments',
            options={'ordering': ['name'], 'verbose_name': 'Отдел', 'verbose_name_plural': 'Отделы'},
        ),
        migrations.AlterModelOptions(
            name='employees',
            options={'ordering': ['l_name', 'f_name', 'department'], 'verbose_name': 'Сотрудник', 'verbose_name_plural': 'Сотрудники'},
        ),
        migrations.AlterModelOptions(
            name='equipment',
            options={'ordering': ['model'], 'verbose_name': 'Техника', 'verbose_name_plural': 'Техника'},
        ),
        migrations.AlterModelOptions(
            name='locations',
            options={'ordering': ['office'], 'verbose_name': 'Помещение', 'verbose_name_plural': 'Помещения'},
        ),
        migrations.AlterModelOptions(
            name='repairs',
            options={'ordering': ['-pk'], 'verbose_name': 'Журнал ремонтов', 'verbose_name_plural': 'Журнал ремонтов'},
        ),
        migrations.AlterModelOptions(
            name='technicalgroups',
            options={'ordering': ['group_dn'], 'verbose_name': 'Техническая группа', 'verbose_name_plural': 'Технические группы'},
        ),
        migrations.AlterModelOptions(
            name='typeofequipment',
            options={'ordering': ['name'], 'verbose_name': 'Тип техники', 'verbose_name_plural': 'Типы техники'},
        ),
        migrations.AlterField(
            model_name='employees',
            name='department',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.Departments', verbose_name='Отдел'),
        ),
        migrations.AlterField(
            model_name='employees',
            name='fired',
            field=models.DateField(blank=True, default=None, null=True, verbose_name='Дата увольнения'),
        ),
        migrations.AlterField(
            model_name='employees',
            name='personal_number',
            field=models.IntegerField(default=0, verbose_name='Табельный номер'),
        ),
        migrations.AlterField(
            model_name='equipment',
            name='brand',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.Brands', verbose_name='Брэнд'),
        ),
        migrations.AlterField(
            model_name='equipment',
            name='model',
            field=models.TextField(verbose_name='Модель'),
        ),
        migrations.AlterField(
            model_name='equipment',
            name='type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.TypeOfEquipment', verbose_name='Тип'),
        ),
        migrations.AlterField(
            model_name='locations',
            name='building',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.Buildings', verbose_name='Филиал'),
        ),
        migrations.AlterField(
            model_name='locations',
            name='department',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.Departments', verbose_name='Отдел'),
        ),
        migrations.AlterField(
            model_name='repairs',
            name='customer_in',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repairs_repairs_customer_in', to='repairs.Employees', verbose_name='Сдал в ремонт'),
        ),
        migrations.AlterField(
            model_name='repairs',
            name='customer_out',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='repairs_repairs_customer_out', to='repairs.Employees', verbose_name='Принял из ремонта'),
        ),
        migrations.AlterField(
            model_name='repairs',
            name='date_in',
            field=models.DateTimeField(verbose_name='Дата поступления'),
        ),
        migrations.AlterField(
            model_name='repairs',
            name='date_out',
            field=models.DateTimeField(blank=True, default=None, null=True, verbose_name='Дата выдачи'),
        ),
        migrations.AlterField(
            model_name='repairs',
            name='employee',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repairs_repairs_employee', to='repairs.Employees', verbose_name='Принял в ремонт'),
        ),
        migrations.AlterField(
            model_name='repairs',
            name='equipment',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.Equipment', verbose_name='Техника'),
        ),
        migrations.AlterField(
            model_name='repairs',
            name='location',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.Locations', verbose_name='Помещение'),
        ),
        migrations.AlterField(
            model_name='typeofequipment',
            name='name',
            field=models.TextField(verbose_name='Название'),
        ),
    ]

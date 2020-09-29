from django.db import models
from django.contrib.auth.models import User


class Departments(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    short_name = models.TextField(unique=True)
    department_dn = models.TextField(blank=True)

    def __str__(self):
        return self.short_name

    class Meta:
        verbose_name = 'Отдел'
        verbose_name_plural = 'Отделы'
        ordering = ['name']


class Employees(models.Model):
    is_deleted = models.BooleanField(default=False)
    personal_number = models.IntegerField(default=0,
                                          verbose_name='Табельный номер')
    user = models.OneToOneField(User, on_delete=models.CASCADE,
                                null=True, blank=True, default=None)
    l_name = models.TextField()
    f_name = models.TextField(blank=True)
    patronymic = models.TextField(blank=True)
    department = models.ForeignKey(Departments,
                                   on_delete=models.CASCADE,
                                   verbose_name='Отдел')
    fired = models.DateField(null=True, blank=True, default=None,
                             verbose_name='Дата увольнения')

    def __str__(self):
        return '{}{}{}'.format(
            self.l_name,
            f' {self.f_name[0]}.' if self.f_name else '',
            f'{self.patronymic[0]}.' if self.patronymic else '',
        )

    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'
        ordering = ['l_name', 'f_name', 'department']


class TechnicalGroups(models.Model):
    employees = models.ManyToManyField(Employees)
    group_dn = models.TextField(unique=True)

    def __str__(self):
        return self.group_dn

    class Meta:
        verbose_name = 'Техническая группа'
        verbose_name_plural = 'Технические группы'
        ordering = ['group_dn']


class Buildings(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    short_name = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Филиал'
        verbose_name_plural = 'Филиалы'
        ordering = ['name']


class Locations(models.Model):
    is_deleted = models.BooleanField(default=False)
    office = models.TextField()
    phone = models.TextField(blank=True)
    department = models.ForeignKey(Departments,
                                   on_delete=models.CASCADE,
                                   verbose_name='Отдел')
    building = models.ForeignKey(Buildings,
                                 on_delete=models.CASCADE,
                                 verbose_name='Филиал')

    def __str__(self):
        return f'{self.office} ({self.department})'

    class Meta:
        verbose_name = 'Помещение'
        verbose_name_plural = 'Помещения'
        ordering = ['office']


class Brands(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    short_name = models.TextField()

    def __str__(self):
        return self.short_name

    class Meta:
        verbose_name = 'Брэнд'
        verbose_name_plural = 'Брэнды'
        ordering = ['name']


class TypeOfEquipment(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField(verbose_name='Название')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Тип техники'
        verbose_name_plural = 'Типы техники'
        ordering = ['name']


class Equipment(models.Model):
    is_deleted = models.BooleanField(default=False)
    type = models.ForeignKey(TypeOfEquipment,
                             on_delete=models.CASCADE,
                             verbose_name='Тип')
    brand = models.ForeignKey(Brands,
                              on_delete=models.CASCADE,
                              verbose_name='Брэнд')
    model = models.TextField(verbose_name='Модель')

    def __str__(self):
        return f'{self.type} ({self.brand} {self.model})'

    class Meta:
        verbose_name = 'Техника'
        verbose_name_plural = 'Техника'
        ordering = ['model']


class Repairs(models.Model):
    is_deleted = models.BooleanField(default=False)
    date_in = models.DateTimeField(verbose_name='Дата поступления')
    location = models.ForeignKey(Locations, on_delete=models.CASCADE,
                                 verbose_name='Помещение')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE,
                                  verbose_name='Техника')
    defect = models.TextField()
    inv_number = models.TextField(blank=True)
    customer_in = models.ForeignKey(
        Employees,
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_customer_in',
        verbose_name='Сдал в ремонт')
    employee = models.ForeignKey(
        Employees,
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_employee',
        verbose_name='Принял в ремонт')
    repair = models.TextField(blank=True)
    current_state = models.TextField(blank=True)
    date_out = models.DateTimeField(null=True, default=None,
                                    blank=True, verbose_name='Дата выдачи')
    customer_out = models.ForeignKey(
        Employees,
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_customer_out',
        null=True,
        blank=True,
        default=None,
        verbose_name='Принял из ремонта')

    def __str__(self):
        return f"""{self.date_in};
                {self.location};
                {self.equipment};
                {self.date_out}
                """

    class Meta:
        verbose_name = 'Журнал ремонтов'
        verbose_name_plural = 'Журнал ремонтов'
        ordering = ['-pk']

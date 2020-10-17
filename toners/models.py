from django.db import models
from repairs.models import (Departments, Equipment, Locations)


class NamesOfTonerCartridge(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField(unique=True)
    printers = models.ManyToManyField(Equipment, verbose_name='Принтеры')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Тип картриджа'
        verbose_name_plural = 'Типы картриджей'
        ordering = ['name']


class Statuses(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    logo = models.TextField()
    link_printer = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Статус'
        verbose_name_plural = 'Статусы'
        ordering = ['name']


class TonerCartridges(models.Model):
    is_deleted = models.BooleanField(default=False)
    prefix = models.TextField()
    number = models.IntegerField()
    names = models.ManyToManyField(NamesOfTonerCartridge,
                                   verbose_name='Типы картриджей')
    owner = models.ForeignKey(Departments,
                              on_delete=models.CASCADE,
                              verbose_name='Владелец')

    def __str__(self):
        return f'{self.prefix}{self.number}'

    class Meta:
        unique_together = ['prefix', 'number']
        verbose_name = 'Картридж'
        verbose_name_plural = 'Картриджи'
        ordering = ['prefix', 'number']


class TonerCartridgesLog(models.Model):
    is_deleted = models.BooleanField(default=False)
    date = models.DateTimeField(verbose_name='Дата')
    toner_cartridge = models.ForeignKey(TonerCartridges,
                                        on_delete=models.CASCADE,
                                        verbose_name='Картридж')
    location = models.ForeignKey(Locations,
                                 on_delete=models.CASCADE,
                                 verbose_name='Расположение')
    equipment = models.ForeignKey(Equipment,
                                  on_delete=models.CASCADE,
                                  null=True, blank=True,
                                  verbose_name='Принтер')
    status = models.ForeignKey(Statuses,
                               on_delete=models.CASCADE,
                               verbose_name='Статус')
    note = models.TextField(blank=True, verbose_name='Примечание')

    def __str__(self):
        return f'{self.location}'

    class Meta:
        verbose_name = 'Журнал перемещения картриджей'
        verbose_name_plural = 'Журнал перемещения картриджей'
        ordering = ['-pk']

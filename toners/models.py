from django.db import models
from repairs.models import (Departments, Equipment, Locations)


class Names_of_toner_cartridge(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    printers = models.ManyToManyField(Equipment)

    def __str__(self):
        return self.name

        class Meta:
            verbose_name = 'Names of toner cartridge'


class Statuses(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    logo = models.TextField()

    def __str__(self):
        return self.name

        class Meta:
            verbose_name = 'Status'
            verbose_name_plural = 'Statuses'


class Toner_cartridges(models.Model):
    is_deleted = models.BooleanField(default=False)
    prefix = models.TextField()
    number = models.IntegerField()
    names = models.ManyToManyField(Names_of_toner_cartridge)
    owner = models.ForeignKey(Departments, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.prefix}{self.number}'

    class Meta:
        unique_together = ['prefix', 'number']
        verbose_name = 'Toner cartridge'


class Toner_cartridges_log(models.Model):
    is_deleted = models.BooleanField(default=False)
    date = models.DateTimeField()
    toner_cartridge = models.ForeignKey(Toner_cartridges, on_delete=models.CASCADE)
    location = models.ForeignKey(Locations, on_delete=models.CASCADE)
    status = models.ForeignKey(Statuses, on_delete=models.CASCADE)
    note = models.TextField(blank=True)

    def __str__(self):
        return self.location

    class Meta:
        verbose_name = 'Toner cartridges log'
        verbose_name_plural = 'Toner cartridges log'

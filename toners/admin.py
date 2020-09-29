from django.contrib import admin
from django.db.models import Q

from repairs.models import Equipment
from .forms import NamesOfTonerCartridgeForm, TonerCartridgesForm, StatusesForm
from .models import (NamesOfTonerCartridge, Statuses,
                     TonerCartridges, TonerCartridgesLog)


class NamesOfTonerCartridgeAdmin(admin.ModelAdmin):
    form = NamesOfTonerCartridgeForm
    filter_horizontal = ['printers']

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "printers":
            kwargs["queryset"] = Equipment.objects.filter(
                Q(type__name__iexact='принтер') | Q(type__name__iexact='МФУ')
            )
        return super().formfield_for_manytomany(db_field, request, **kwargs)


class StatusesAdmin(admin.ModelAdmin):
    form = StatusesForm


class TonerCartridgesAdmin(admin.ModelAdmin):
    form = TonerCartridgesForm
    filter_horizontal = ['names']


class TonerCartridgesLogAdmin(admin.ModelAdmin):
    list_display = ('toner_cartridge', 'location', 'status',)
    list_filter = ('status__name',)


admin.site.register(NamesOfTonerCartridge, NamesOfTonerCartridgeAdmin)
admin.site.register(Statuses, StatusesAdmin)
admin.site.register(TonerCartridges, TonerCartridgesAdmin)
admin.site.register(TonerCartridgesLog, TonerCartridgesLogAdmin)

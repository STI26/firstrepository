from django.contrib import admin

from .models import (NamesOfTonerCartridge, Statuses,
                     TonerCartridges, TonerCartridgesLog)


admin.site.register(NamesOfTonerCartridge)
admin.site.register(Statuses)
admin.site.register(TonerCartridges)
admin.site.register(TonerCartridgesLog)

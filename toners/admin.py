from django.contrib import admin

from .models import (Names_of_toner_cartridge, Statuses,
                     Toner_cartridges, Toner_cartridges_log)


admin.site.register(Names_of_toner_cartridge)
admin.site.register(Statuses)
admin.site.register(Toner_cartridges)
admin.site.register(Toner_cartridges_log)

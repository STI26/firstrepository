from django.contrib import admin

from .models import (Departments, Employees,
                     Buildings, Locations,
                     Brands, Type_of_equipment,
                     Equipment, Repairs,
                     Technical_groups)

admin.site.register(Departments)
admin.site.register(Employees)
admin.site.register(Technical_groups)
admin.site.register(Buildings)
admin.site.register(Locations)
admin.site.register(Brands)
admin.site.register(Type_of_equipment)
admin.site.register(Equipment)
admin.site.register(Repairs)

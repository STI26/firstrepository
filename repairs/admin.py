from django.contrib import admin

from .models import (Departments, Employees,
                     Buildings, Locations,
                     Brands, TypeOfEquipment,
                     Equipment, Repairs,
                     TechnicalGroups)


class DepartmentsAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name',)


class EmployeesAdmin(admin.ModelAdmin):
    list_display = ('l_name', 'f_name', 'department',)
    search_fields = ['l_name']
    list_filter = ('department__short_name',)


class TechnicalGroupsAdmin(admin.ModelAdmin):
    filter_horizontal = ['employees']


class BuildingsAdmin(admin.ModelAdmin):
    pass


class LocationsAdmin(admin.ModelAdmin):
    pass


class BrandsAdmin(admin.ModelAdmin):
    pass


class TypeOfEquipmentAdmin(admin.ModelAdmin):
    pass


class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('type', 'brand', 'model',)


class RepairsAdmin(admin.ModelAdmin):
    list_display = ('id', 'date_in', 'location', 'equipment', 'date_out')


admin.site.register(Departments, DepartmentsAdmin)
admin.site.register(Employees, EmployeesAdmin)
admin.site.register(TechnicalGroups, TechnicalGroupsAdmin)
admin.site.register(Buildings, BuildingsAdmin)
admin.site.register(Locations, LocationsAdmin)
admin.site.register(Brands, BrandsAdmin)
admin.site.register(TypeOfEquipment, TypeOfEquipmentAdmin)
admin.site.register(Equipment, EquipmentAdmin)
admin.site.register(Repairs, RepairsAdmin)

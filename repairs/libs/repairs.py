from datetime import datetime
from django.core.paginator import Paginator
from django.forms.models import model_to_dict
from django.db.models import Max
from django.apps import apps
from repairs.models import (Repairs, Employees, Departments,
                            Technical_groups, Buildings, Locations,
                            Type_of_equipment, Equipment, Brands)


class DataRepairs(object):
    """docstring for Repairs.

    Use 'action' for select method.
    """

    def action(self, operation, user, data=None):
        """Select and run function"""

        self.data = data
        self.user = user

        # Get the method from 'self'. Default to a lambda.
        method = getattr(self, operation,
                         lambda: {'status': False,
                                  'message': f"Метод '{operation}' не найден"})

        # Call the method as we return it
        return method()

    def open(self):
        """Fill modal form"""

        repair = Repairs.objects.get(pk=self.data['id'])

        data = model_to_dict(repair)

        # Get base tables
        result = self.open_new_form()

        # Get customers and locations with the same department
        department = repair.location.department
        customers = Employees.objects.filter(is_deleted=False,
                                             department=department)
        result['customers'] = list(customers.values())
        locations = Locations.objects.filter(is_deleted=False,
                                             department=department)
        result['locations'] = list(locations.values())

        # Get current employee
        employee = Employees.objects.get(pk=repair.employee.pk)

        # Get all employees with the same technical group
        tg = Technical_groups.objects.filter(employees=employee).first()
        employees = tg.employees.all()
        result['employees'] = list(employees.values())

        # Get equipment with the same brand and type
        type = repair.equipment.type
        brand = repair.equipment.brand
        equipment = Equipment.objects.filter(is_deleted=False,
                                             type=type,
                                             brand=brand, )
        result['equipment'] = list(equipment.values())

        data['type'] = type.id
        data['brand'] = brand.id
        data['department'] = department.id
        result['repair'] = data

        return result

    def save(self):
        """Save current row in database"""

        id = int(self.data['id'])

        if self.data['customer_out']:
            customerOut = Employees.objects.get(pk=self.data['customer_out'])
        else:
            customerOut = self.data['customer_out']

        defaults = {
            'date_in': self.data['date_in'],
            'location': Locations.objects.get(pk=self.data['location']),
            'equipment': Equipment.objects.get(pk=self.data['equipment']),
            'defect': self.data['defect'],
            'inv_number': self.data['inv_number'],
            'customer_in': Employees.objects.get(pk=self.data['customer_in']),
            'employee': Employees.objects.get(pk=self.data['employee']),
            'repair': self.data['repair'],
            'current_state': self.data['current_state'],
            'date_out': self.data['date_out'],
            'customer_out': customerOut,
        }

        # Create new row
        if id < 0:
            Repairs.objects.create(**defaults)
        # Update row
        else:
            count = Repairs.objects.filter(pk=id).update(**defaults)

            if count == 0:
                return {'status': False,
                        'message': f'Запись №{id} не найдена.'}

        return {'status': True,
                'message': f'Запись №{id} успешно сохранена.'}

    def remove(self):
        """Remove current row in database"""

        id = int(self.data['id'])

        count = Repairs.objects.filter(pk=id).update(is_deleted=True)

        if count == 0:
            return {'status': False,
                    'message': f'Запись №{id} не найдена.'}

        return {'status': True,
                'message': f'Запись №{id} удалена.'}

    def copy(self):
        """Remove current row in database"""

        id = int(self.data['id'])

        try:
            r = Repairs.objects.get(pk=id)
            r.pk = None
            r.save()
        except Repairs.DoesNotExist:
            return {'status': False,
                    'message': f'Запись №{id} не найдена.'}

        return {'status': True,
                'message': f'Запись №{id} успешно скопирована.'}

    def open_new_form(self):
        """Get a new ID and auxiliary lists for a new form"""

        # Get new ID
        newid = Repairs.objects.aggregate(Max('id'))['id__max'] + 1

        # Get all buildings
        buildings = Buildings.objects.filter(is_deleted=False)

        # Get all departments
        departments = Departments.objects.filter(is_deleted=False)

        # Get current employee
        employee = Employees.objects.get(user=self.user)

        # Get all employees with the same technical group
        tg = Technical_groups.objects.filter(employees=employee).first()
        employees = tg.employees.all()

        # Get all types of equipment
        types = Type_of_equipment.objects.filter(is_deleted=False)

        # Get all brands
        brands = Brands.objects.filter(is_deleted=False)

        return {'buildings': list(buildings.values()),
                'departments': list(departments.values()),
                'employees': list(employees.values()),
                'brands': list(brands.values()),
                'types': list(types.values()),
                'defaultEmployee': employee.id,
                'newid': newid, }

    def change_department(self):
        """Get lists of locations and employees
        relevant to the current department
        """

        department = Departments.objects.get(pk=self.data['id'])

        locations = Locations.objects.filter(is_deleted=False,
                                             department=department)
        employees = Employees.objects.filter(is_deleted=False,
                                             department=department)

        return {'locations': list(locations.values()),
                'employees': list(employees.values()), }

    def change_equipment_type_or_brand(self):
        """Get list of equipment
        relevant to the current type of equipment and brand
        """

        type = Type_of_equipment.objects.get(pk=self.data['type'])
        brand = Brands.objects.get(pk=self.data['brand'])

        equipment = Equipment.objects.filter(is_deleted=False,
                                             type=type,
                                             brand=brand)

        return {'equipment': list(equipment.values())}

    def get_auxiliary_table(self):
        """Get list of departments, types, brands
        """

        try:
            model = apps.get_model('repairs', self.data['table'])
        except LookupError:
            return {'status': False,
                    'message': f"Таблица '{self.data['table']}' не найдена."}

        result = model.objects.filter(is_deleted=False)

        return {'status': True,
                'message': f"Таблица '{self.data['table']}' загружена.",
                'data': list(result.values())}

    def add_row_to_auxiliary_table(self):
        """Add new row to auxiliary table

        Format:
        self.data['table'] - table name
        self.data['vars'] - dict new values
        """

        try:
            model = apps.get_model('repairs', self.data['table'])
        except KeyError:
            return {'status': False,
                    'message': "Неверный запрос! data['table'] отсутствует."}
        except LookupError:
            return {'status': False,
                    'message': f"Таблица '{self.data['table']}' не найдена."}

        id = model.objects.create(**self.data['vars'])

        return {'status': True,
                'message': f'Запись №{id.id} успешно сохранена.'}

    def load_repairs(self):
        """Load repairs table

        Format:
        self.data.number - number of rows returned(0 = all rows); type: int
        self.data.currentPage - current page; type: int
        self.data.activeRepairs - if true only active repairs; type: bool

        Return:
        {repairs: repairs data, time: current time}
        """

        # Get current time
        time = datetime.now().strftime('%d.%m.%y %H:%M:%S')

        if self.data['activeRepairs']:
            # Select only active repairs
            repairs = Repairs.objects.filter(date_out__isnull=True,
                                             is_deleted=False)
        else:
            # Select all repairs
            repairs = Repairs.objects.filter(is_deleted=False)

        # Show all repairs
        if self.data['number'] == 0:
            return {'repairs': self._formatForMainPage(repairs),
                    'paginator': None,
                    'time': time, }

        #  Show 'self.data['number']' repairs per page
        paginator = Paginator(repairs, self.data['number'])
        p = paginator.get_page(self.data['currentPage'])

        hasPrevious = p.has_previous()
        previousPageNumber = p.previous_page_number() if hasPrevious else None
        hasNext = p.has_next()
        nextPageNumber = p.next_page_number() if hasNext else None
        numPages = paginator.num_pages

        paginator = {'hasPrevious': hasPrevious,
                     'previousPageNumber': previousPageNumber,
                     'hasNext': hasNext,
                     'nextPageNumber': nextPageNumber,
                     'numPages': numPages, }

        return {'repairs': self._formatForMainPage(p),
                'paginator': paginator,
                'time': time}

    def _formatForMainPage(self, pageObj):

        result = []
        for row in pageObj:
            if row.date_out is not None:
                dateOut = row.date_out.strftime('%d.%m.%y %H:%M')
                customerOut = str(row.customer_out)
            else:
                dateOut = ''
                customerOut = ''

            item = {
                'id': row.pk,
                'dateIn': row.date_in.strftime('%d.%m.%y %H:%M'),
                'customerIn': str(row.customer_in),
                'employee': str(row.employee),
                'department': str(row.location),
                'phone': row.location.phone,
                'equipment': str(row.equipment),
                'invNumber': row.inv_number,
                'defect': row.defect,
                'repair': row.repair,
                'currentState': row.current_state,
                'dateOut': dateOut,
                'customerOut': customerOut,
            }

            result.append(item)

        return result

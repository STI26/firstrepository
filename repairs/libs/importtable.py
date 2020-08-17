from repairs.libs.db_postgresql import Table
from repairs.models import (Repairs, Employees, Departments,
                            Equipment, Buildings, Locations,
                            Type_of_equipment, Brands)


def i_repairs():
    with Table('repairs') as r:
        rows = r.get_rows()

    for row in rows:
        new, created = Repairs.objects.update_or_create(
            id=row['id'],
            defaults={
                'date_in': row['date_in'],
                'department': Departments.objects.get(pk=row['department_id']),
                'location': Locations.objects.get(pk=row['location_id']),
                'equipment': Equipment.objects.get(pk=row['equipment_id']),
                'defect': row['defect'] if row['defect'] is not None else '',
                'inv_number': row['inv_number'] if row['inv_number'] is not None else '',
                'customer_in': Employees.objects.get(pk=row['customer_id_in']),
                'employee': Employees.objects.get(pk=row['employee_id']),
                'repair': row['repair'] if row['repair'] is not None else '',
                'current_state': row['current_state'] if row['current_state'] is not None else '',
                'date_out': row['date_out'],
                'customer_out': None if row['customer_id_out'] is None else Employees.objects.get(pk=row['customer_id_out']),
            },
        )

    return rows


def i_departments():
    with Table('departments') as d:
        rows = d.get_rows()

    for row in rows:
        new, created = Departments.objects.update_or_create(
            id=row['id'],
            defaults={
                'name': row['name'],
                'short_name': row['short_name'],
                # TODO: department_dn
                # 'department_dn': '',
            },
        )

    return rows


def i_employees():
    with Table('employees') as e:
        rows = e.get_rows()

    for row in rows:
        new, created = Employees.objects.update_or_create(
            id=row['id'],
            defaults={
                'l_name': row['l_name'],
                'f_name': row['f_name'] if row['f_name'] is not None else '',
                'patronymic': row['patronymic'] if row['patronymic'] is not None else '',
                'department': Departments.objects.get(pk=row['department_id']),
            },
        )

    return rows


def i_buildings():
    with Table('buildings') as b:
        rows = b.get_rows()

    for row in rows:
        new, created = Buildings.objects.update_or_create(
            id=row['id'],
            defaults={
                'name': row['name'],
                'short_name': row['short_name'],
            },
        )

    return rows


def i_locations():
    with Table('locations') as loc:
        rows = loc.get_rows()

    for row in rows:
        new, created = Locations.objects.update_or_create(
            id=row['id'],
            defaults={
                'office': row['office'],
                'phone': row['phone'] if row['phone'] is not None else '',
                'department': Departments.objects.get(pk=row['department_id']),
                'building': Buildings.objects.get(pk=row['building_id']),
            },
        )

    return rows


def i_brands():
    with Table('equipment') as e:
        rows = e.get_rows()

    for row in rows:
        new, created = Brands.objects.update_or_create(
            name=row['brand'],
            defaults={
                'short_name': row['brand'],
            },
        )

    return rows


def i_type_of_equipment():
    with Table('type_of_equipment') as t:
        rows = t.get_rows()

    for row in rows:
        new, created = Type_of_equipment.objects.update_or_create(
            id=row['id'],
            defaults={
                'name': row['name'],
            },
        )

    return rows


def i_equipment():
    with Table('equipment') as e:
        rows = e.get_rows()

    for row in rows:
        new, created = Equipment.objects.update_or_create(
            id=row['id'],
            defaults={
                'type': Type_of_equipment.objects.get(pk=row['type_id']),
                'brand': Brands.objects.get(name=row['brand']),
                'model': row['model'] if row['model'] is not None else 'noname',
            },
        )

    return rows


def i_all():

    i_departments()
    i_employees()
    i_buildings()
    i_locations()
    i_brands()
    i_type_of_equipment()
    i_equipment()
    i_repairs()

    return {'status': 'ok'}

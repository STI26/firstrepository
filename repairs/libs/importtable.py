from repairs.libs.db_postgresql import Table
from repairs.models import (Repairs, Employees, Departments,
                            Technical_groups, Buildings, Locations,
                            Type_of_equipment, Equipment, Brands)


def i_repairs():
    with Table('repairs') as r:
        rows = r.get_rows()

    new, created = Repairs.objects.update_or_create(
        id='',
        defaults={
            'date_in': '',
            'department': '',
            'location': '',
            'equipment': '',
            'defect': '',
            'inv_number': '',
            'customer_in': '',
            'employee': '',
            'repair': '',
            'current_state': '',
            'date_out': '',
            'customer_out': '',
        },
    )

    return rows

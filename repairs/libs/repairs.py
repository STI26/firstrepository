from datetime import datetime
from django.core.paginator import Paginator
from repairs.models import (Repairs, Employees, Departments,
                            Technical_groups, Buildings, Locations,
                            Type_of_equipment, Equipment, Brands)


class DataRepairs(object):
    """docstring for Repairs.

    Use 'action' for select method.
    """

    def action(self, operation, data=None):
        """Select and run function"""

        self.data = data

        # Get the method from 'self'. Default to a lambda.
        method = getattr(self, operation,
                         lambda: f"can't find '{operation}'.")

        # Call the method as we return it
        return method()

    def open(self):
        """Fill modal form"""

        # TODO: ...

        # Check row
        if len(row) != 1:
            return None
        else:
            return row[0]

    def save(self):
        """Save current row in database"""

        # TODO: ...

        return {'status': True, 'message': 'ok'}

    def remove(self):
        """Remove current row in database"""

        # TODO: ...

        return {'status': True, 'message': 'ok'}

    def get_new_id(self):
        """Get a new ID and auxiliary lists for a new form"""

        return row

    def change_department(self):
        """Get lists of locations and employees
        relevant to the current department
        """

        # Get data from function 'action'
        if data is None:
            data = self.data

        # TODO: ...

        return row

    def change_equipment_type(self):
        """Get list of equipment
        relevant to the current type of equipment
        """

        # TODO: ...

        return row

    def add_to_auxiliary_table(self, return_all=True):
        """Add new row to auxiliary table

        Format:
        self.data['table'] - table name
        self.data['vars'] - dict new values

        return_all - if True return all rows in current table
        """

        # TODO: ...

        return rows

    def load_repairs(self):
        """Load repairs table

        Format:
        self.data.number - number of rows returned(None = all rows); type: int
        self.data.currentPage - current page; type: int
        self.data.activeRepairs - if true only active repairs; type: bool

        Return:
        {repairs: repairs data, time: current time}
        """

        if self.data['activeRepairs']:
            # Select only active repairs
            repairs = Repairs.objects.filter(date_out__isnull=True)
        else:
            # Select all repairs
            repairs = Repairs.objects.all()

        #  Show 'self.data['number']' repairs per page
        paginator = Paginator(repairs, self.data['number'])
        p = paginator.get_page(self.data['currentPage'])

        hasPrevious = p.has_previous()
        previousPageNumber = p.previous_page_number() if hasPrevious else None
        hasNext = p.has_next()
        nextPageNumber = p.next_page_number() if hasNext else None
        numPages = paginator.num_pages

        data = {'hasPrevious': hasPrevious,
                'previousPageNumber': previousPageNumber,
                'hasNext': hasNext,
                'nextPageNumber': nextPageNumber,
                'numPages': numPages,
                'data': self._formatForMainPage(p)}

        # Get current time
        time = datetime.now().strftime('%d.%m.%y %H:%M:%S')

        return {'repairs': data,
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

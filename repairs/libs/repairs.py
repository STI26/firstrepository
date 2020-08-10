from tools import (showDate, forming_repairs)
from decouple import config
from django.http import JsonResponse

# Short name of the technical department
TECHNICAL_DEPARTMENT = config('TECHNICAL_DEPARTMENT')


class Repairs(object):
    """docstring for Repairs.

    Use 'action' for select method.
    """

    def __init__(self):
        super(Repairs, self).__init__()

    def action(self, operation, data=None):
        """Select and run function"""

        self.data = data
        self._technical_department_id = self._technical_department()

        # Get the method from 'self'. Default to a lambda.
        method = getattr(self, operation,
                         lambda: JsonResponse(f"can't find '{operation}'."))

        # Call the method as we return it
        return method()

    def _technical_department(self):
        """Select and run function"""

        # Get ID technical department
        with Table('departments') as db:
            row = db.get_rows_by_value({'short_name': TECHNICAL_DEPARTMENT})
            try:
                self._technical_department_id = row[0]['id']
            except Exception as e:
                self._technical_department_id = 0
                print('Can\'t find department with name "{}" in database\n{}'.
                      format(TECHNICAL_DEPARTMENT, e))

        # Call the method as we return it
        return 'td_id'

    def open(self, data=None):
        """Fill modal form"""

        # TODO: ...

        # Check row
        if len(row) != 1:
            return JsonResponse(None)
        else:
            return JsonResponse(row[0])

    def save(self, data=None):
        """Save current row in database"""

        # TODO: ...

        return JsonResponse({'status': True, 'message': 'ok'})

    def remove(self, data=None):
        """Remove current row in database"""

        # TODO: ...

        return JsonResponse({'status': True, 'message': 'ok'})

    def get_new_id(self):
        """Get a new ID and auxiliary lists for a new form"""

        return JsonResponse(row)

    def change_department(self, data=None):
        """Get lists of locations and employees
        relevant to the current department
        """

        # Get data from function 'action'
        if data is None:
            data = self.data

        # TODO: ...

        return JsonResponse(row)

    def change_equipment_type(self, data=None):
        """Get list of equipment
        relevant to the current type of equipment
        """

        # TODO: ...

        return JsonResponse(row)

    def add_to_auxiliary_table(self, data=None, return_all=True):
        """Add new row to auxiliary table

        Format:
        data['table'] - table name
        data['vars'] - dict new values

        return_all - if True return all rows in current table
        """

        # TODO: ...

        return JsonResponse(rows)

    def load_repairs(self, data=None, convertJSON=True):
        """Load repairs table

        Format:
        data.number - number of rows returned(None = all rows); type: int
        data.startNumber - first row number(OFFSET); type: int
        data.activeRepairs - if true only active repairs; type: bool
        note:
        self.data from function 'action' is used by default

        convertJSON: if true return JSON; if false return dict

        Return:
        {repairs: list of dict, numberRows: int}
        """

        # TODO: ...

        # Return JSON
        return JsonResponse({'repairs': repairs,
                             'numberRows': numberRows,
                             'time': time})

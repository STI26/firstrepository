import datetime
from django.db.models import Q, Max, Count, DateTimeField
from django.db.models.functions import Trunc
from repairs.models import (Repairs, Departments, Equipment, Locations)
from toners.models import (NamesOfTonerCartridge, Statuses,
                           TonerCartridges, TonerCartridgesLog)


class Charts(object):
    """included methods:
    getDataForCharts() - Get data for charts.

    Use 'action' for select method.
    """

    def action(self, operation, data=None):
        """Select and run function"""

        self.data = data

        # Get the method from 'self'. Default to a lambda.
        method = getattr(self, operation,
                         lambda: {'status': False,
                                  'message': f"Метод '{operation}' не найден"})

        # Call the method as we return it
        return method()

    def getDataForCharts(self):
        """Get data for charts."""

        range = (datetime.date(2005, 1, 1), datetime.date(2020, 3, 31))
        field = 'date_in' if self.data.get('repaired') else 'date_out'
        kind = self.data.get('kind')

        repairsIn = Repairs.objects.filter(
            is_deleted=False,
            date_in__range=range,
        )

        repairsOut = Repairs.objects.filter(
            is_deleted=False,
            date_out__range=range,
        )

        return {'repairsIn': self._getRepairsStats(repairsIn, field, kind),
                'repairsOut': self._getRepairsStats(repairsOut, field, kind), }

    def _getRepairsStats(self, QuerySet, field, kind):

        repairsLog = QuerySet.annotate(
            group=Trunc(field, kind, output_field=DateTimeField()),
        ).order_by(
            'group'
        ).values(
            'group'
        ).annotate(count=Count('id'))

        repairsStats = QuerySet.order_by(
            'equipment__type'
        ).values(
            'equipment__type__name'
        ).annotate(
            count=Count('equipment__type')
        )

        return {'log': list(repairsLog), 'stats': list(repairsStats)}

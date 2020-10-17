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

        range = (datetime.date(2005, 1, 1), datetime.date(2020, 10, 31))
        kind = self.data.get('kind')

        return {'repairsIn': self._getRepairsStats(range, 'date_in', kind),
                'repairsOut': self._getRepairsStats(range, 'date_out', kind),
                'toners': self._getTonersStats(range, 'date', kind), }

    def _getRepairsStats(self, range, field, kind):

        filter = {
            'is_deleted': False,
            f'{field}__range': range,
        }
        repairs = Repairs.objects.filter(**filter)

        # Get the number of records per kind for a period of time
        repairsLog = repairs.annotate(
            group=Trunc(field, kind, output_field=DateTimeField())
        ).order_by(
            'group'
        ).values(
            'group'
        ).annotate(count=Count('id'))

        # Get the number of equipment of each type for a period of time
        repairsStats = repairs.order_by(
            'equipment__type'
        ).values(
            'equipment__type__name'
        ).annotate(
            count=Count('equipment__type')
        )

        return {'log': list(repairsLog), 'stats': list(repairsStats)}

    def _getTonersStats(self, range, field, kind):

        filter = {
            'is_deleted': False,
            'status__link_printer': True,
            f'{field}__range': range,
        }
        toners = TonerCartridgesLog.objects.filter(**filter)

        # Get the number of records per kind for a period of time
        tonersLog = toners.annotate(
            group=Trunc(field, kind, output_field=DateTimeField())
        ).order_by(
            'group'
        ).values(
            'group'
        ).annotate(count=Count('id'))

        # Get the number of printers of each type for a period of time
        tonersStats = toners.order_by(
            'equipment__brand', 'equipment__model',
        ).values(
            'equipment__brand__short_name', 'equipment__model',
        ).annotate(
            count=Count('equipment__type')
        )

        tonersStats = map(self._combineEquipmentName, tonersStats)

        return {'log': list(tonersLog), 'stats': list(tonersStats)}

    def _combineEquipmentName(self, dictWithEquipment):

        pattern = '{} {}'.format(
            dictWithEquipment.pop('equipment__brand__short_name'),
            dictWithEquipment.pop('equipment__model'),
        )

        dictWithEquipment.update({'printer': pattern})

        return dictWithEquipment

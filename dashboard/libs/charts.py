import datetime
from django.db.models import Count, DateTimeField
from django.db.models.functions import Trunc
from repairs.models import Repairs
from toners.models import TonerCartridgesLog


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

        range = self._getDateRange(self.data.get('range'))
        kind = self._getDatePeriod(self.data.get('range'))

        return {'repairsIn': self._getRepairsStats(range, 'date_in', kind),
                'repairsOut': self._getRepairsStats(range, 'date_out', kind),
                'toners': self._getTonersStats(range, 'date', kind), }

    def _getRepairsStats(self, range, field, kind):

        filter = {'is_deleted': False}

        if range:
            filter[f'{field}__range'] = range

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
        }

        if range:
            filter[f'{field}__range'] = range

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

    def _convertDate(self, strDate):

        return datetime.datetime.strptime(strDate,
                                          '%Y-%m-%dT%H:%M:%S.%fZ').date()

    def _checkCustomRange(self, customRange):

        if not customRange or len(customRange) != 2:
            return None

        return tuple(map(self._convertDate, customRange))

    def _getDateRange(self, range):

        now = datetime.datetime.now()

        patterns = {
            'all-time': None,
            'year': ((now - datetime.timedelta(days=365)).date(),
                     now.date(), ),
            'month': ((now - datetime.timedelta(days=30)).date(),
                      now.date(), ),
            'week': ((now - datetime.timedelta(days=7)).date(),
                     now.date(), ),
            'custom': self._checkCustomRange(self.data.get('customRange')),
        }

        return patterns.get(range)

    def _getDatePeriod(self, range):

        patterns = {
            'all-time': 'year',
            'year': 'month',
            'month': 'day',
            'week': 'day',
            'custom': self.data.get('period', 'day'),
        }

        return patterns.get(range)

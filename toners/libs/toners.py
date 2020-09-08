from datetime import datetime
from django.core.paginator import Paginator
from django.forms.models import model_to_dict
from django.db.models import Max
from django.apps import apps
from repairs.models import (Departments, Equipment, Locations)
from toners.models import (NamesOfTonerCartridge, Statuses,
                           TonerCartridges, TonerCartridgesLog)
import re


class DataToners(object):
    """included methods:
    loadToners() - Get toner-cartridges with current status.
    tonerLog() - Get the history of the current toner-cartridge.
    save() - Save current row in database.
    remove() - Remove current row in database.
    move() - Save movement toner-cartridge in log.


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

    def loadToners(self):
        """Get toner-cartridges with current status.

        Format:
        self.data.number - number of rows returned(0 = all rows); type: int
        self.data.currentPage - current page; type: int
        self.data.names - filtration by type of toner-cartridges;
                          type: list
        self.data.statuses - filtration by statuses of toner-cartridges;
                          type: list

        Return:
        {toners: toners data, paginator: paginator data, time: current time}
        """

        if self.data.get('names', None) is not None:
            filter = {'names__in': self.data['names']}
        else:
            filter = {}

        # Get toner-cartridges by type
        cartridges = TonerCartridges.objects \
            .filter(is_deleted=False, **filter).values()

        # Get the latest status of toner-cartridges
        for cartridge in cartridges:
            try:
                lastStatus = TonerCartridgesLog.objects \
                    .filter(toner_cartridge=cartridge['id']) \
                    .latest('date')
            except TonerCartridgesLog.DoesNotExist:
                lastStatus = None

            if lastStatus is not None:
                fields = ['date', 'location', 'status', 'note']
                cartridge.update(model_to_dict(lastStatus, fields))

            statuses = self.data.get('statuses', None)
            # Remove unnecessary items
            if statuses is not None and \
               cartridge.get('status') not in statuses:
                cartridges.remove(cartridge)

        # Get current time
        time = datetime.now().strftime('%d.%m.%y %H:%M:%S')

        #  Show 'self.data['number']' toner-cartridges per page
        paginator = Paginator(list(cartridges), self.data['number'])
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

        return {'toners': p.object_list,
                'paginator': paginator,
                'time': time, }

    def TonerLog(self):
        """Get the history of the current toner-cartridge."""

        # Split id
        try:
            prefix, number = self._splitID(self.data.get('id', ''))
        except TypeError:
            return {'status': False,
                    'message': f'Неверный формат ID.'}

        # Get all records with the current id
        log = TonerCartridgesLog.objects.filter(
            is_deleted=False,
            prefix__iexact=prefix,
            number=number,
        )

        return {'status': True,
                'message': '',
                'log': list(log.values()), }

    def save(self):
        """Save current row in database."""

        new = TonerCartridges(
            prefix=self.data['prefix'],
            number=self.data['number'],
            owner=Departments.objects.get(pk=self.data['owner']),
        )

        new.save()
        names = []
        for nameID in self.data['names']:
            name = NamesOfTonerCartridge.objects.get(pk=nameID)
            names.append(name)
        new.names.set(names)

        # Save toner-cartridge in log
        if self.data.get('log'):
            self.move(self.data['log'])

        return {'status': True,
                'message': f'Запись №{new.id} успешно сохранена.'}

    def remove(self):
        """Remove current row in database."""

        # Split id
        try:
            prefix, number = self._splitID(self.data.get('id', ''))
        except TypeError:
            return {'status': False,
                    'message': f'Неверный формат ID.'}

        toner = TonerCartridges.objects.filter(prefix=prefix, number=number)
        count = toner.update(is_deleted=True)
        if count == 0:
            return {'status': False,
                    'message': f'Запись №{prefix}{number} не найдена.'}

        return {'status': True,
                'message': f'Запись №{id} удалена.'}

    def move(self, data=None):
        """Save movement toner-cartridge in log."""

        if data is None:
            data = self.data

        new = TonerCartridgesLog.objects.create(
            data=data['date'],
            toner_cartridge=TonerCartridges.objects.get(
                pk=data['toner_cartridge']
            ),
            location=Locations.objects.get(pk=data['location']),
            status=Statuses.objects.get(pk=data['status']),
            note=data['note'],
        )

        return {'status': True,
                'message': f'Запись №{new.id} успешно сохранена.'}

    def _splitID(self, id):
        """Split id into prefix and number."""

        id = re.match(
            r'([a-z]+)([0-9]+)',
            id,
            re.IGNORECASE,
        )
        if id:
            prefix, number = id.groups()
        else:
            return None

        return prefix, number

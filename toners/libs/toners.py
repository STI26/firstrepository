from datetime import datetime
from django.core.paginator import Paginator
from django.forms.models import model_to_dict
from django.db.models import Max
from django.apps import apps
from toners.models import (Names_of_toner_cartridge, Statuses,
                           Toner_cartridges, Toner_cartridges_log)


class DataToners(object):
    """docstring for ."""

    def __init__(self, arg):
        self.arg = arg

from django import forms


class NamesOfTonerCartridgeForm(forms.ModelForm):
    name = forms.CharField(widget=forms.TextInput, label='Тип')


class TonerCartridgesForm(forms.ModelForm):
    prefix = forms.CharField(widget=forms.TextInput, label='Префикс')
    number = forms.IntegerField(min_value=0, label='Номер')


class StatusesForm(forms.ModelForm):
    name = forms.CharField(widget=forms.TextInput, label='Имя')
    logo = forms.CharField(
        widget=forms.TextInput,
        label='Имя иконки',
        help_text='Выберите имя feathericon (https://feathericons.com/)',
    )

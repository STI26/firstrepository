from django import forms


class BuildingsForm(forms.ModelForm):
    name = forms.CharField(widget=forms.Textarea, label='Имя')
    short_name = forms.CharField(widget=forms.TextInput,
                                 label='Сокращённое имя')


class DepartmentsForm(BuildingsForm):
    department_dn = forms.CharField(widget=forms.TextInput, required=False)


class BrandsForm(BuildingsForm):
    pass


class EmployeesForm(forms.ModelForm):
    l_name = forms.CharField(widget=forms.TextInput, label='Фамилия')
    f_name = forms.CharField(widget=forms.TextInput, label='Имя',
                             required=False)
    patronymic = forms.CharField(widget=forms.TextInput, label='Отчество',
                                 required=False)


class LocationsForm(forms.ModelForm):
    office = forms.CharField(widget=forms.TextInput, label='Помещение')
    phone = forms.CharField(widget=forms.TextInput, label='Телефон',
                            required=False)


class RepairsForm(forms.ModelForm):
    defect = forms.CharField(widget=forms.Textarea, label='Неисправность')
    inv_number = forms.CharField(widget=forms.TextInput, label='Инв. номер',
                                 required=False)
    repair = forms.CharField(widget=forms.Textarea,
                             label='Проведённые работы',
                             required=False)
    current_state = forms.CharField(widget=forms.TextInput,
                                    label='Примечание',
                                    required=False)

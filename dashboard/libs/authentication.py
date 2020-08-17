from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from repairs.models import Employees, Departments, Technical_groups

from dashboard.libs.ldap import Ldap
from decouple import config, Csv

# OES groups that are allowed access
SECURITY_EQUALS = config('LDAP_SECURITY_EQUALS',
                         cast=Csv(delimiter=';', post_process=list))

UserModel = get_user_model()


class LDAPBackend(ModelBackend):
    """Modified default ModelBackend"""

    def authenticate(self,
                     request,
                     username=None,
                     password=None,
                     context=None):
        """Returns user info if successful"""

        if username is None or password is None:
            return None

        with Ldap(username, password, context) as oes:

            isValid = oes.validUser()
            groupDN = oes.checkSecurityEquals(SECURITY_EQUALS)
            userInfo = oes.getUserInfo()

            if not (isValid or groupDN or userInfo):
                return None

            userInfo['groupDN'] = groupDN
            user = self._updateOrCreateUser(userInfo)

        return user

    def _updateOrCreateUser(self, info):
        """Return a user object"""

        try:
            user = UserModel._default_manager.get_by_natural_key(info['username'])
        except UserModel.DoesNotExist:
            # Create new user
            user = UserModel.objects.create_user(username=info['username'])

        # Update user info
        user.is_staff = True
        user.is_active = True
        user.is_superuser = False
        user.first_name = info['firstName']
        user.last_name = info['lastName']
        user.email = info['email']
        user.save()

        # Synchronization with employee model
        self._employeeSynchronization(info)

        return user

    def _employeeSynchronization(self, info):
        """Update employee info.
        Update technical group.
        """

        # Get department
        department, created = Departments.objects.get_or_create(
            department_dn__iexact=info['departmentDN'],
            short_name__iexact=info['department'],
        )
        if created:
            department.name = info['departmentDescription']
            department.save()

        # Update employee
        employee, created = Employees.objects.update_or_create(
            personal_number=info['personalNumber'],
            defaults={
                'f_name': info['firstName'],
                'l_name': info['lastName'],
                'patronymic': info['patronymic'],
                'department': department,
            },
        )

        # Get 'technical group'
        technicalGroup, created = Technical_groups.objects.get_or_create(
            group_dn=info['groupDN']
        )
        # Update employees consisting in the technical group
        technicalGroup.employee.add(employee)

        return None

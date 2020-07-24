from ldap import Ldap
from decouple import config, Csv

# OES groups that are allowed access
SECURITY_EQUALS = config('LDAP_SECURITY_EQUALS',
                         cast=Csv(delimiter=';', post_process=list))


class LDAPBackend(object):
    """docstring for LDAPBackend."""

    def __init__(self, username, context, password):
        super(LDAPBackend, self).__init__()
        self.username = username
        self.context = context
        self.password = password

    def login(self):
        """returns user info if successful"""

        with Ldap(self.username, self.context, self.password) as oes:

            if not oes.validUser():
                return 'valid fail'

            self.groupDN = oes.checkSecurityEquals(SECURITY_EQUALS)
            if not self.groupDN:
                return 'access denied'

            self.userInfo = oes.getUserInfo()
            if not self.userInfo:
                return 'can\'t get user info'

        return

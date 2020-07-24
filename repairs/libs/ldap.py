from ldap3 import Server, Connection, SUBTREE, LEVEL
from decouple import config

LDAP_HOST = config('LDAP_HOST')


class CheckContext(object):
    """docstring for CheckContext."""

    def __init__(self):
        """Connect to an host

        Anonymous authentication is used
        """

        super(CheckContext, self).__init__()
        self._server = Server(LDAP_HOST, use_ssl=True)

        # Authentication anonymous
        self._connection = Connection(self._server,
                                      auto_bind=False,
                                      read_only=True,
                                      fast_decoder=False)

        try:
            self.connection.bind()
        except self.connection.result as e:
            raise e

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """Disconnect from host"""

        if exc_type is not None:
            raise Exception(exc_type, exc_value, traceback)

        self.connection.unbind()

        return True

    @property
    def connection(self):
        return self._connection

    def _splitDN(self, dn):
        """Convert string Distinguished Name to list

        format dn(string):
        'objectClass=valueObjectClass, objectClass2=valueObjectClass2, ...'
        format return(list):
        [{'objectClass': objectClass, 'name': valueObjectClass},
         {'objectClass': objectClass2, 'name': valueObjectClass2}, ...]
        """

        # Split DN on objectClass
        listDN = dn.split(',')

        # Length result
        r = len(listDN)

        # Split objectClass on type/value
        for x in range(r):
            listDN[x] = {'objectClass': listDN[x].split('=')[0],
                         'name': listDN[x].split('=')[1]}

        # Reverse
        listDN.reverse()

        return listDN

    def _checkDN(self, dn, tree):
        """Check name in list of dict"""

        # Search dn in tree
        for x in tree:
            # If found
            if x['name'].lower() == dn.lower():
                # Return position x in tree
                return tree.index(x)

        return False

    def _formTree(self, response):
        """Convert strings Distinguished Names to tree

        node = {'name': '', 'objectClass': '', 'node': []}
        """

        # Initializing new list
        result = list()

        for item in response:
            # Initializing link to a list
            tmp = result

            # Split Distinguished Name
            r = self._splitDN(item['dn'])

            for x in r:
                # Check if there is a dict with name x['name'] in the list
                currentDict = self._checkDN(x['name'], tmp)

                if currentDict is False:
                    description = item['attributes'].setdefault(
                                      'description',
                                      ''
                                  )

                    # Add new node
                    tmp.insert(0, {'name': x['name'],
                                   'objectClass': x['objectClass'],
                                   'description': description,
                                   'children': []})
                    currentDict = 0

                # Set new link to a list
                tmp = tmp[currentDict].get('children')

        return result

    def getContexts(self, attr=[]):
        """Get the contexts tree

        Return list of nodes
        node = {'name': '', 'objectClass': '', 'children': []}
        """

        # Search contexts
        ret = self.connection.search(
            search_base='',
            search_filter='''(|(objectClass=organizationalUnit)
                              (objectClass=organization))''',
            search_scope=SUBTREE,
            attributes=attr)

        # Search error
        if not ret:
            return None

        # Convert to tree
        tree = self._formTree(self.connection.response)

        return tree

    def getContextDN(self, context):
        """Check context in tree

        Format context: 'level2.level1.level0'
        If find context return DN
        """

        dn = ''

        # Get tree context
        tree = self.getContexts()

        listCont = context.split('.')
        listCont.reverse()

        # Initializing link to a list
        tmpTree = tree

        for x in range(len(listCont)):
            # Check if there is a dict with name 'context' in the list
            pos = self._checkDN(listCont[x], tmpTree)

            # Context not found
            if pos is False:
                return False

            # Get RDN
            listCont[x] = '{}={}'.format(tmpTree[pos].get('objectClass'),
                                         tmpTree[pos].get('name'))

            # Set new link to a list
            tmpTree = tmpTree[pos].get('children')

        listCont.reverse()

        # RDN are separated by a comma
        dn = ','.join(map(str, listCont))

        return dn


class Ldap(object):
    """docstring for Ldap."""

    def __init__(self, userName, context, password):
        """Connect to an host
        use context format: 'organizationalUnitName.organizationName'

        Simple authentication is used
        """

        super(Ldap, self).__init__()
        self._server = Server(LDAP_HOST, use_ssl=True)

        # Authentication simple
        with CheckContext() as cont:
            self._context = cont.getContextDN(context)
        self._userName = userName
        self._userDN = f'cn={self._userName},{self._context}'
        self._connection = Connection(self._server,
                                      user=self._userDN,
                                      password=password,
                                      auto_bind=False,
                                      version=3,
                                      authentication='SIMPLE',
                                      client_strategy='SYNC',
                                      auto_referrals=False,
                                      read_only=True,
                                      lazy=False,
                                      check_names=True,
                                      raise_exceptions=False,
                                      auto_encode=True)
        try:
            self.connection.bind()
        except self.connection.result as e:
            raise e

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """Disconnect from host"""

        if exc_type is not None:
            raise Exception(exc_type, exc_value, traceback)

        self.connection.unbind()

        return True

    @property
    def connection(self):
        return self._connection

    def checkSecurityEquals(self, dns):
        """Checking for the presence of DN's in the 'securityEquals' group.

        return dn or False
        """

        # Search contexts
        ret = self.connection.search(
            search_base=self._context,
            search_filter=f'(cn={self._userName})',
            search_scope=LEVEL,
            attributes=['securityEquals'])

        # Search error
        if not ret:
            return False

        result = self.connection.response

        # If found more than one username
        if len(result) != 1:
            return False

        # Check 'securityEquals' for the presence of DN
        for dn in dns:
            if dn in result[0]['attributes']['securityEquals']:
                return dn

        return False

    def validUser(self):
        """User validation

        return True or False
        """

        if not (('description' in self.connection.result
                and 'success' == self.connection.result['description'])
                and self.connection.bound
                and self.connection.user == self._userDN):

            return False

        return True

    def getUserInfo(self, userId=None):
        """Get user info

        If more then one user returns 'False'
        """

        if userId:
            base = ''
            filter = f'(generationQualifier={userId})'
            scope = SUBTREE
        else:
            base = self._context
            filter = f'(cn={self._userName})'
            scope = LEVEL

        ret = self.connection.search(
            search_base=base,
            search_filter=filter,
            search_scope=scope,
            attributes=['fullName',
                        'generationQualifier',
                        'ou',
                        'l',
                        'mail'])

        # Search error
        if not ret:
            return None

        info = self.connection.response

        # If found more than one username
        if len(info) != 1:
            return False

        description = self._getDepartmentName()['message']
        fullName = info[0]['attributes']['fullName'][0].split()
        try:
            firstName = fullName[1].capitalize()
        except IndexError:
            firstName = ''

        try:
            lastName = fullName[0].capitalize()
        except IndexError:
            lastName = ''

        try:
            patronymic = fullName[2].capitalize()
        except IndexError:
            patronymic = ''

        return {'firstName': firstName,
                'lastName': lastName,
                'patronymic': patronymic,
                'id': info[0]['attributes']['generationQualifier'],
                'department': info[0]['attributes']['ou'][0],
                'departmentDN': self._context,
                'departmentDescription': description,
                'location': info[0]['attributes']['l'][0],
                'mail': info[0]['attributes']['mail'][0]}

    def _getDepartmentName(self):
        """Get user info

        return dict:
        success - True or False
        message - description or error message
        If more then one user returns 'False'
        """

        ret = self.connection.search(
            search_base=f'{self._context}',
            search_filter='(objectClass=organizationalUnit)',
            search_scope=SUBTREE,
            attributes=['description']
        )

        # Search error
        if not ret:
            return {'success': False,
                    'message': 'Search error'}

        info = self.connection.response

        # If found more than one username
        if len(info) != 1:
            return {'success': False,
                    'message': 'Description not found'}

        return {'success': True,
                'message': info[0]['attributes']['description'][0].strip()}

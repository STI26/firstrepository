from ldap import Ldap
from getpass import getpass


def login(name, context, password):

    # Authentication with LDAP
    with Ldap(name, context, password) as oes:
        # User validation
        result = oes.validUser()
        print(f'result: {result}')
        if result is not True:
            return {'message': f'error valid: {result}'}

        info = oes.getUserInfo()
        print(f'info: {info}')

        return info


if __name__ == '__main__':

    name = input('name: ')
    context = input('context: ')
    password = getpass('password: ')

    info = login(name, context, password)

    for k, v in info.items():
        print(f'{k}: {v}')

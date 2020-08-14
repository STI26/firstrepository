from psycopg2 import sql, connect, Error
import psycopg2.extras
from werkzeug.security import generate_password_hash


hostname = '127.0.0.1'
username = 'postgres'
password = 'bto3'
database = 'bto3'


class Table(object):
    """DB initializes and manipulates PostgreSQL databases."""

    def __init__(self, table_name=None):
        """connect to an existing database"""

        super(Table, self).__init__()
        self.table_name = table_name
        self._tables_map = {'repairs': {'department_id': 'departments.id',
                                        'location_id': 'locations.id',
                                        'equipment_id': 'equipment.id',
                                        'customer_id_in': 'employees.id',
                                        'employee_id': 'employees.id',
                                        'customer_id_out': 'employees.id'},
                            'users': {'equipment_id': 'equipment.id'},
                            'employees': {'department_id': 'departments.id'},
                            'locations': {'department_id': 'departments.id'},
                            'equipment': {'type_id': 'type_of_equipment.id'}}

        # Connect to db
        self._connection = connect(host=hostname,
                                   user=username,
                                   password=password,
                                   dbname=database)
        # self._connection.row_factory = sqlite3.Row
        self._cursor = self.connection.cursor(
                       cursor_factory=psycopg2.extras.DictCursor)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """Disconnect from db"""

        if exc_type is not None:
            raise Exception(exc_type, exc_value, traceback)

        self.connection.close()

        return True

    @property
    def connection(self):
        return self._connection

    @property
    def cursor(self):
        return self._cursor

    def sql_query(self, sql_query):
        """SQL query execution"""

        # Forming sql query
        query = sql.SQL(sql_query)

        try:
            # Insert new row in table
            self.cursor.execute(query)

        except Error as e:
            raise TypeError("Error: {reason}"
                            .format(reason=e))
        else:
            # Save (commit) the changes
            self.connection.commit()

        return True

    def number_rows(self, filter='id', include=True):
        """Find the number of rows in a table

        filter: column name by which rows are filtered(string)
        include: True - include only rows with a value in the filtered column
                 False - include only rows without a value in the filtered
                         column
        """

        # Forming sql query
        query = sql.SQL(
                '''SELECT COUNT(id) FROM {table}
                WHERE {filter} {include}
                AND is_deleted != TRUE''').format(
                    table=sql.Identifier(self.table_name),
                    filter=sql.Identifier(filter),
                    include=sql.SQL('IS NOT NULL' if include else 'IS NULL'))

        try:
            # Find number of rows
            self.cursor.execute(query)

        except Error as e:
            raise TypeError("SQLite error: {reason}"
                            .format(reason=e))

        # Fetch one row
        result = self.cursor.fetchone()

        return result[0]

    def get_rows(self, count=None, startNumber=0,
                 filter='id', include=True, sort=['id'],
                 joinTable=False, directionASC=True):
        """Get a list of rows from a table

        count: number of rows returned(integer)
               note: if None returned allrows
        startNumber: first row number(OFFSET)
        filter: column name by which rows are filtered(string)
        include: True - include only rows with a value in the filtered column
                 False - include only rows without a value in the filtered
                         column
        sort: sort columns(list of string)
        joinTable: join auxiliary tables
        directionASC: sort ascending(boolean)
        """

        if joinTable:
            pass

        # Forming sql query
        direction = sql.SQL(' ASC, ' if directionASC else ' DESC, ')
        query = sql.SQL(
                '''SELECT * FROM {table} WHERE {filter} {include}
                AND is_deleted != TRUE
                ORDER BY {sort} {direction}
                LIMIT %s OFFSET  %s''').format(
                    table=sql.Identifier(self.table_name),
                    filter=sql.Identifier(filter),
                    include=sql.SQL('IS NOT NULL' if include else 'IS NULL'),
                    direction=sql.SQL('ASC' if directionASC else 'DESC'),
                    sort=direction.join(sql.Identifier(n) for n in sort))

        # Select number of rows
        self.cursor.execute(query, [count, startNumber])

        # Fetch all rows
        rows = self.cursor.fetchall()

        # Convert psycopg2.extras.DictCursor object to dict
        for x in range(len(rows)):
            rows[x] = dict(rows[x])

        return rows

    def get_rows_by_value(self, arguments, strict=True,
                          sort=['id'], directionASC=True):
        """Get a list of rows from a table with filter

        Format:
        arguments: {column: value} (type - dict)
        strict:
            True - return only rows with the same values
            False - return all rows containing values(for string)
        sort: sort columns(list of string)
        directionASC: sort ascending(boolean)
        """

        patern = '{}' if strict is True else '%{}%'
        keys = []
        values = []
        for key, value in arguments.items():
            if value is not None:
                keys.append(key)
                values.append(patern.format(str(value)))

        # Forming sql query
        direction = sql.SQL(' ASC, ' if directionASC else ' DESC, ')
        query = sql.SQL(
                '''SELECT * FROM {table} WHERE CAST({args} AS TEXT) ILIKE %s
                AND is_deleted != TRUE
                ORDER BY {sort} {direction}''').format(
                    table=sql.Identifier(self.table_name),
                    args=sql.SQL(' AS TEXT) ILIKE %s AND CAST(')
                            .join(map(sql.Identifier, keys)),
                    sort=direction.join(sql.Identifier(n) for n in sort),
                    direction=sql.SQL('ASC' if directionASC else 'DESC'))

        # Select all rows where 'column' equal 'value'
        self.cursor.execute(query, values)

        # Fetch all rows
        rows = self.cursor.fetchall()

        # Convert psycopg2.extras.DictCursor object to dict
        for x in range(len(rows)):
            rows[x] = dict(rows[x])

        return rows

    def get_column(self, column):
        """Get a list of different values"""

        # Forming sql query
        query = sql.SQL(
                'SELECT DISTINCT %s FROM {}').format(
                        sql.Identifier(self.table_name))

        # Select different values in 'column'
        self.cursor.execute(query, [column])

        # Fetch all rows
        result = self.cursor.fetchall()

        return result

    def add_row(self, arguments):
        """Add row in 'table_name'

        format: arguments = {key: value} (type: dict)
        return: ID from the last insert
        """

        keys = []
        values = []
        for key, value in arguments.items():
            keys.append(key)
            values.append(value)

        # Change empty string to null
        for index, x in enumerate(values):
            if x == '':
                values[index] = None

        # Forming sql query
        query = sql.SQL(
                'INSERT INTO {0} ({1}) VALUES ({2}) RETURNING id').format(
                        sql.Identifier(self.table_name),
                        sql.SQL(', ').join(map(sql.Identifier, keys)),
                        sql.SQL(', ').join(sql.Placeholder() * len(values)))

        try:
            # Insert new row in table
            self.cursor.execute(query, values)

        except Error as e:
            raise TypeError("Couldn't update table: {reason}"
                            .format(reason=e))
        else:
            # Save (commit) the changes
            self.connection.commit()

        # Get ID from the last insert
        lastId = self.cursor.fetchone()

        return lastId[0]

    def edit_row(self, arguments, row_id):
        """Edit row in 'table_name'

        format:
        arguments = editable values {db_key: value} (type: dict)
        row_id = id current row (type: int)
        """

        keys = []
        values = []
        for key, value in arguments.items():
            keys.append(key)
            values.append(value)

        # Change empty string to null
        for index, x in enumerate(values):
            if x == '':
                values[index] = None

        # Forming sql query
        query = sql.SQL('UPDATE {0} SET {1}=%s WHERE {2}=%s').format(
                    sql.Identifier(self.table_name),
                    sql.SQL('=%s, ').join(map(sql.Identifier, keys)),
                    sql.Identifier('id'))

        values.append(row_id)
        try:
            # Insert new row in table
            self.cursor.execute(query, values)

        except Error as e:
            raise TypeError("Couldn't update table: {reason}"
                            .format(reason=e))
            return False
        else:
            # Save (commit) the changes
            self.connection.commit()

        return True

    def get_max_id(self):
        """Get max ID in 'table_name'"""

        # Forming sql query
        query = sql.SQL('SELECT MAX(id) FROM {}').format(
                    sql.Identifier(self.table_name))

        # Find max ID in 'table_name'
        self.cursor.execute(query)

        # Fetch one row
        result = self.cursor.fetchone()

        if result[0] is None:
            result = 0
        else:
            result = result[0]

        return result

    def get_updated_rows(self):
        """Get updated rows"""

        # TODO: ....
        # Find max ID in 'table_name'
        pass

        return True


def create_all_tables():
    """Create all tables for site."""

    # Preparing a request for trigger function
    trigger_function = '''
    CREATE FUNCTION public.log_change()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF
    AS $BODY$DECLARE
        delta_key      		integer;
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            delta_key = -1;
        ELSE
            delta_key = new.id;
        END IF;
        INSERT INTO log (
                            table_id,
                            row_id,
                            dt,
                            type_of_action
                        )
                        VALUES (
                            TG_TABLE_NAME,
                            delta_key,
                            LOCALTIMESTAMP,
                            TG_OP
                        );
        RETURN NULL;
    END;$BODY$;
    '''

    # Preparing a request for 'log' table
    log = '''CREATE TABLE public.log
    (
        id serial NOT NULL,
        table_id text COLLATE pg_catalog."default" NOT NULL,
        row_id integer NOT NULL,
        dt timestamp without time zone NOT NULL,
        type_of_action text COLLATE pg_catalog."default" NOT NULL,
        CONSTRAINT log_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;
    '''

    # Preparing a request for 'users' table
    users = """CREATE TABLE users
    (
        id serial NOT NULL,
        username text COLLATE pg_catalog."default" NOT NULL,
        hash text COLLATE pg_catalog."default" NOT NULL,
        role text COLLATE pg_catalog."default",
        employee_id integer,
        is_deleted boolean NOT NULL DEFAULT false,
        CONSTRAINT users_pkey PRIMARY KEY (id),
        CONSTRAINT users_username_key UNIQUE (username)
    )
    WITH (
        OIDS = FALSE
    );
    """

    # Preparing a request for 'repairs' table
    repairs = '''CREATE TABLE repairs
    (
        id serial NOT NULL,
        date_in timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        department_id integer NOT NULL,
        location_id integer,
        equipment_id integer NOT NULL,
        defect text COLLATE pg_catalog."default" NOT NULL,
        inv_number text COLLATE pg_catalog."default" NOT NULL,
        customer_id_in integer NOT NULL,
        employee_id integer NOT NULL,
        repair text COLLATE pg_catalog."default",
        current_state text COLLATE pg_catalog."default",
        date_out timestamp without time zone,
        customer_id_out integer,
        is_deleted boolean NOT NULL DEFAULT false,
        CONSTRAINT repairs1_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    );
    '''

    # Preparing a request for trigger 'repairs_log'
    trigger_repairs = '''CREATE TRIGGER repairs_log
        AFTER INSERT OR DELETE OR UPDATE
        ON public.repairs
        FOR EACH ROW
        EXECUTE PROCEDURE public.log_change();
    '''

    # Preparing a request for 'employees' table
    employees = '''CREATE TABLE public.employees
    (
        id serial NOT NULL,
        l_name text COLLATE pg_catalog."default" NOT NULL,
        f_name text COLLATE pg_catalog."default",
        patronymic text COLLATE pg_catalog."default",
        department_id integer,
        is_deleted boolean NOT NULL DEFAULT false,
        CONSTRAINT employees_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    );
    '''

    # Preparing a request for trigger 'employees_log'
    trigger_employees = '''CREATE TRIGGER employees_log
        AFTER INSERT OR DELETE OR UPDATE
        ON public.employees
        FOR EACH ROW
        EXECUTE PROCEDURE public.log_change();
    '''

    # Preparing a request for 'departments' table
    departments = '''CREATE TABLE public.departments
    (
        id serial NOT NULL,
        name text COLLATE pg_catalog."default" NOT NULL,
        short_name text COLLATE pg_catalog."default",
        is_deleted boolean NOT NULL DEFAULT false,
        CONSTRAINT departments_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    );
    '''

    # Preparing a request for trigger 'departments_log'
    trigger_departments = '''CREATE TRIGGER departments_log
        AFTER INSERT OR DELETE OR UPDATE
        ON public.departments
        FOR EACH ROW
        EXECUTE PROCEDURE public.log_change();
    '''

    # Preparing a request for 'buildings' table
    buildings = '''CREATE TABLE public.buildings
    (
        id serial NOT NULL,
        name text COLLATE pg_catalog."default" NOT NULL,
        short_name text COLLATE pg_catalog."default",
        is_deleted boolean NOT NULL DEFAULT false,
        CONSTRAINT buildings_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    );
    '''

    # Preparing a request for trigger 'buildings_log'
    trigger_buildings = '''CREATE TRIGGER buildings_log
        AFTER INSERT OR DELETE OR UPDATE
        ON public.buildings
        FOR EACH ROW
        EXECUTE PROCEDURE public.log_change();
    '''

    # Preparing a request for 'locations' table
    locations = '''CREATE TABLE public.locations
    (
        id serial NOT NULL,
        department_id integer NOT NULL,
        office text COLLATE pg_catalog."default",
        building_id integer,
        phone text COLLATE pg_catalog."default",
        is_deleted boolean NOT NULL DEFAULT false,
        CONSTRAINT locations_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    );
    '''

    # Preparing a request for trigger 'locations_log'
    trigger_locations = '''CREATE TRIGGER locations_log
        AFTER INSERT OR DELETE OR UPDATE
        ON public.locations
        FOR EACH ROW
        EXECUTE PROCEDURE public.log_change();
    '''

    # Preparing a request for 'equipment' table
    equipment = '''CREATE TABLE public.equipment
    (
        id serial NOT NULL,
        type_id integer NOT NULL,
        brand text COLLATE pg_catalog."default",
        model text COLLATE pg_catalog."default",
        is_deleted boolean NOT NULL DEFAULT false,
        CONSTRAINT equipment_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    );
    '''

    # Preparing a request for trigger 'equipment_log'
    trigger_equipment = '''CREATE TRIGGER equipment_log
        AFTER INSERT OR DELETE OR UPDATE
        ON public.equipment
        FOR EACH ROW
        EXECUTE PROCEDURE public.log_change();
    '''

    # Preparing a request for 'type_of_equipment' table
    type_of_equipment = '''CREATE TABLE public.type_of_equipment
    (
        id serial NOT NULL,
        name text COLLATE pg_catalog."default" NOT NULL,
        is_deleted boolean NOT NULL DEFAULT false,
        CONSTRAINT type_of_equipment_pkey PRIMARY KEY (id)
    )
    WITH (
        OIDS = FALSE
    );
    '''

    # Preparing a request for trigger 'type_of_equipment_log'
    trigger_type_of_equipment = '''CREATE TRIGGER type_of_equipment_log
        AFTER INSERT OR DELETE OR UPDATE
        ON public.type_of_equipment
        FOR EACH ROW
        EXECUTE PROCEDURE public.log_change();
    '''

    # Create all tables and triggers
    with Table() as db:
        db.sql_query(trigger_function)
        db.sql_query(log)
        db.sql_query(users)
        db.sql_query(repairs)
        db.sql_query(trigger_repairs)
        db.sql_query(employees)
        db.sql_query(trigger_employees)
        db.sql_query(departments)
        db.sql_query(trigger_departments)
        db.sql_query(locations)
        db.sql_query(trigger_locations)
        db.sql_query(buildings)
        db.sql_query(trigger_buildings)
        db.sql_query(equipment)
        db.sql_query(trigger_equipment)
        db.sql_query(type_of_equipment)
        db.sql_query(trigger_type_of_equipment)

    # Set password hash for admin
    hash = generate_password_hash('admin')

    # Add admin in 'users' table
    with Table('users') as db:
        arguments = {'username': 'admin', 'hash': hash}
        db.add_row(arguments)

    return


def drop_all_tables():
    """Drop all tables"""

    with Table() as db:
        db.sql_query('DROP SCHEMA public CASCADE;')
        db.sql_query('CREATE SCHEMA public;')
        db.sql_query('GRANT ALL ON SCHEMA public TO postgres;')
        db.sql_query('GRANT ALL ON SCHEMA public TO public;')

    return

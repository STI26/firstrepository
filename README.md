# Technical Department Journal


## Installation

```bash
git clone https://github.com/STI26/tdjournal.git
pip install -r requirements.txt
mv .env.example .env
# change settings in .env file
manage.py migrate
manage.py createsuperuser 
```

## Usage

```bash
python3 manage.py runserver
```

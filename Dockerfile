FROM python:3.8.3-alpine

STOPSIGNAL SIGQUIT

WORKDIR /app
COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-b", "0.0.0.0:8000", "--workers", "2", "app:app", "--access-logfile", "-"]

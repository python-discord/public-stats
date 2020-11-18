# Stage 1: Build the HTML
FROM node:14.8.0-stretch AS builder
COPY . .
RUN npm install && yarn build && yarn cache clean

# Stage 2: Set up the backend
FROM python:3.8-slim
STOPSIGNAL SIGQUIT

# Install all dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the HTML from Stage 1
COPY --from=builder /build /app/build

# Copy files into the /app directory
WORKDIR /app
COPY . .

# Start the server with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8000", "--workers", "2", "app:app", "--access-logfile", "-"]

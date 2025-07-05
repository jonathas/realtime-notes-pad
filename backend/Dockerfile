FROM python:3.11-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc libffi-dev musl-dev

WORKDIR /code
COPY ./requirements.txt /code/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Final stage
FROM python:3.11-alpine

WORKDIR /code

# Copy installed packages from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY ./app /code/app

CMD ["fastapi", "run", "app/main.py", "--proxy-headers", "--port", "8000"]

FROM mcr.microsoft.com/devcontainers/python:3.11

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    apt-get install -y \
    curl \
    git \
    postgresql-client \
    vim \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade black flake8 isort pip

WORKDIR /workspace

CMD ["sleep", "infinity"]
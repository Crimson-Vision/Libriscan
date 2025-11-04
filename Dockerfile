# Basically yoinked from https://www.docker.com/blog/how-to-dockerize-django-app/

ARG PYTHON_VERSION="3.14"

# Stage 1: Base build stage
FROM python:${PYTHON_VERSION}-slim AS builder

# Pull the version args into this build stage
ARG PYTHON_VERSION

LABEL org.opencontainers.image.title="Libriscan"
LABEL org.opencontainers.image.description="Libriscan helps extract and analyze text from historical documents."
LABEL org.opencontainers.image.source="https://github.com/crimson-vision/libriscan"
LABEL org.opencontainers.image.url="https://github.com/crimson-vision/libriscan"

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.9.5 /uv /uvx /bin/

# Create the app directory
RUN mkdir /app

# Set the working directory
WORKDIR /app

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# uv doesn't need to use a venv here
ENV UV_SYSTEM_PYTHON=1

# Copy the requirements file first (better caching)
COPY libriscan/requirements.txt /app/

# Install Python dependencies
RUN uv pip install --no-cache-dir -r requirements.txt

# Stage 2: Production stage
FROM python:${PYTHON_VERSION}-slim

# Pull the args we need into this build stage too
ARG PYTHON_VERSION
ARG DOCKER_METADATA_OUTPUT_VERSION
ARG DOCKER_METADATA_OUTPUT_TAGS

RUN useradd -m -r appuser && \
    mkdir /app && \
    chown -R appuser /app

# Copy the Python dependencies from the builder stage
COPY --from=builder /usr/local/lib/python${PYTHON_VERSION}/site-packages/ /usr/local/lib/python${PYTHON_VERSION}/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Set the working directory
WORKDIR /app

# Copy application code
COPY --chown=appuser:appuser libriscan .

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV LB_TAGS=${DOCKER_METADATA_OUTPUT_TAGS}
ENV LB_VERSION=${DOCKER_METADATA_OUTPUT_VERSION}

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 8000

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint script as the default command
CMD ["/app/entrypoint.sh"]

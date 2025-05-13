
FROM python:3.11.0-bullseye

ADD ZscalerRootCertificate-2048-SHA256.crt /usr/local/share/ca-certificates/ZscalerRootCertificate.crt
RUN chmod 644 /usr/local/share/ca-certificates/ZscalerRootCertificate.crt && update-ca-certificates
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

# Switch working directory
WORKDIR /app

# Install the dependencies and packages from poetry
RUN pip install "poetry==2.0.0"

# Copy every content from the local file to the image
COPY . /app


ARG DATAIN
ENV DATAIN=${DATAIN}

ARG DATAOUT
ENV DATAOUT=${DATAOUT}

# Install poetry dependencies
RUN poetry config virtualenvs.create false \
  && poetry install --no-root --no-interaction --no-ansi

# Configure the container to run with parameters
ENTRYPOINT [ "python", "digitize.py" ]

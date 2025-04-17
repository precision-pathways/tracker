
FROM python:3.11.0-bullseye

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

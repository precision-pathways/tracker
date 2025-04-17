# Precision Digitizer

A Python-based tool for converting DICOM medical images into 3D models using VTK.

## Prerequisites

- Python 3.11+
- [Poetry](https://python-poetry.org/) for dependency management
- Docker (optional, for containerized usage)

## Installation

1. Clone the repository:
    ```sh
    git clone <repo-url>
    cd precision-digitizer
    ```

2. Install dependencies with Poetry:
    ```sh
    poetry install
    ```

## Usage

### With Docker

Set up the environment variables and run the container:

```sh
docker-compose up precision-digitizer
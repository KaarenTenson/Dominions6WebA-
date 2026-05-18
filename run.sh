#!/bin/bash

set -e

echo "Stopping old containers..."
docker compose down

echo "Building containers..."
docker compose build --no-cache

echo "Starting containers..."
docker compose up
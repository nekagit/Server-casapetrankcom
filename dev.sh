#!/bin/bash

# Casa Petrada Development Script
# Quick start for development environment

echo "🚀 Starting Casa Petrada Development Environment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the casapetrankcom root directory"
    exit 1
fi

# Run the main development script
./scripts/start-astro-dev.sh


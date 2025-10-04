#!/bin/bash

# Casa Petrada Deployment Script

set -e  # Exit on any error

echo "🚀 Casa Petrada Deployment Script"
echo "================================="

# Configuration
DOMAIN="test.nenadkalicanin.com"
WEB_ROOT="/var/www/${DOMAIN}"
PROJECT_ROOT="/var/www/karaweiss/casapetrankcom"
BACKEND_PORT="8001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the casapetrankcom root directory"
    exit 1
fi

print_status "Starting Casa Petrada deployment..."

# Step 1: Build Frontend
print_status "Building frontend application..."
cd frontend

if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

print_status "Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Frontend build failed!"
    exit 1
fi

print_status "Frontend build completed successfully!"

# Step 2: Deploy Frontend
print_status "Deploying frontend to ${WEB_ROOT}..."

# Create web directory if it doesn't exist
sudo mkdir -p "${WEB_ROOT}"

# Copy built files
sudo cp -r dist/* "${WEB_ROOT}/"

# Set proper permissions
sudo chown -R www-data:www-data "${WEB_ROOT}"
sudo chmod -R 755 "${WEB_ROOT}"

print_status "Frontend deployed successfully!"

# Step 3: Setup Backend
cd ../backend

print_status "Setting up backend environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
print_status "Installing backend dependencies..."
source venv/bin/activate
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    print_error "Backend dependency installation failed!"
    exit 1
fi

print_status "Backend dependencies installed successfully!"

# Step 4: Create systemd service for backend
print_status "Creating systemd service for Casa Petrada backend..."

sudo tee /etc/systemd/system/casa-petrada-backend.service > /dev/null <<EOF
[Unit]
Description=Casa Petrada FastAPI Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${PROJECT_ROOT}/backend
Environment=PATH=${PROJECT_ROOT}/backend/venv/bin
ExecStart=${PROJECT_ROOT}/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port ${BACKEND_PORT}
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable casa-petrada-backend.service
sudo systemctl restart casa-petrada-backend.service

print_status "Backend service created and started!"

# Step 5: Test nginx configuration and reload
print_status "Testing nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed!"
    exit 1
fi

print_status "Reloading nginx..."
sudo systemctl reload nginx

# Step 6: Verify deployment
print_status "Verifying deployment..."

# Wait a moment for services to start
sleep 3

# Test frontend
print_status "Testing frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k https://${DOMAIN})

if [ "$FRONTEND_STATUS" = "200" ]; then
    print_status "✅ Frontend is responding correctly (HTTP $FRONTEND_STATUS)"
else
    print_warning "⚠️  Frontend returned HTTP $FRONTEND_STATUS"
fi

# Test backend
print_status "Testing backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${BACKEND_PORT}/health)

if [ "$BACKEND_STATUS" = "200" ]; then
    print_status "✅ Backend is responding correctly (HTTP $BACKEND_STATUS)"
else
    print_warning "⚠️  Backend returned HTTP $BACKEND_STATUS"
fi

# Final status
echo ""
echo "🎉 Casa Petrada Deployment Complete!"
echo "====================================="
echo ""
echo "📱 Frontend URL: https://${DOMAIN}"
echo "🔧 Backend API: http://localhost:${BACKEND_PORT}"
echo "📚 API Documentation: http://localhost:${BACKEND_PORT}/docs"
echo ""
echo "🔍 Service Status:"
echo "   Frontend: $(systemctl is-active nginx)"
echo "   Backend:  $(systemctl is-active casa-petrada-backend)"
echo ""
echo "📊 Monitoring:"
echo "   Frontend Logs: sudo tail -f /var/log/nginx/${DOMAIN}.access.log"
echo "   Backend Logs:  sudo journalctl -u casa-petrada-backend -f"
echo ""
echo "🛠  Management:"
echo "   Restart Backend: sudo systemctl restart casa-petrada-backend"
echo "   Reload Frontend: sudo systemctl reload nginx"
echo ""
echo "Happy selling! 🛍️✨"

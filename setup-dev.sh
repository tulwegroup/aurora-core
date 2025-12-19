#!/bin/bash

# Aurora Core Development Setup Script
# This script sets up the development environment

echo "🚀 Setting up Aurora Core Development Environment..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   On macOS: brew install node"
    echo "   On Ubuntu: sudo apt-get install nodejs npm"
    exit 1
fi

# Setup database
echo "📊 Setting up database..."
read -p "Enter PostgreSQL username (default: postgres): " db_user
db_user=${db_user:-postgres}
read -p "Enter PostgreSQL password: " -s db_pass
echo

# Create database and user
sudo -u postgres psql -c "CREATE USER aurora_user WITH PASSWORD 'aurora_pass';" 2>/dev/null || echo "User might already exist"
sudo -u postgres psql -c "CREATE DATABASE aurora_core OWNER aurora_user;" 2>/dev/null || echo "Database might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aurora_core TO aurora_user;" 2>/dev/null

# Initialize database schema
echo "🗃️ Initializing database schema..."
cd aurora
export DATABASE_URL="postgresql://aurora_user:aurora_pass@localhost:5432/aurora_core"
psql $DATABASE_URL -f ../db/init.sql

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd ../frontend
npm install

# Setup environment files
echo "⚙️ Setting up environment files..."
cd ..
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local 2>/dev/null || echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api" > frontend/.env.local

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start the backend: cd aurora/backend && npm run dev"
echo "   2. Start the frontend: cd aurora/frontend && npm run dev"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see README.md"
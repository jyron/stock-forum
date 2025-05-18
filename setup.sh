#!/bin/bash

# Stock Forum Setup Script

echo "Setting up Stock Forum application..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo "Setup complete! You can now run the application with:"
echo "npm run dev"

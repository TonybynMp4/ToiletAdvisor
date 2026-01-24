#!/bin/bash

echo "Creating .env files from .env.example..."

# Copy frontend .env.example
folder="./apps/web"
if [ -f "$folder/.env.example" ]; then
	cp "$folder/.env.example" "$folder/.env"
	echo "Frontend .env created"
else
	echo "Frontend .env.example not found"
fi

# Copy API .env.example
folder="./apps/api-server"
if [ -f "$folder/.env.example" ]; then
	cp "$folder/.env.example" "$folder/.env"
	echo "API Server .env created"
else
	echo "API Server .env.example not found"
fi

# Copy Auth .env.example
folder="./apps/auth-server"
if [ -f "$folder/.env.example" ]; then
	cp "$folder/.env.example" "$folder/.env"
	echo "Auth Server .env created"
else
	echo "Auth Server .env.example not found"
fi

echo ".env files created."
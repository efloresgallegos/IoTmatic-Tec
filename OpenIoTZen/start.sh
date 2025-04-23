#!/bin/bash

# Script para iniciar OpenIoTZen
echo "Iniciando OpenIoTZen..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Error: Docker no está instalado. Por favor, instale Docker antes de continuar."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose no está instalado. Por favor, instale Docker Compose antes de continuar."
    exit 1
fi

# Verificar si los contenedores ya están corriendo
if [ $(docker ps | grep openiotzen | wc -l) -eq 3 ]; then
    echo "Los servicios de OpenIoTZen ya están en ejecución."
    echo "Frontend: http://localhost:9000"
    echo "Backend: http://localhost:3000"
    echo "Base de datos: localhost:5432"
    exit 0
fi

# Verificar si los contenedores existen pero están detenidos
if [ $(docker ps -a | grep openiotzen | wc -l) -gt 0 ]; then
    echo "Reiniciando servicios existentes..."
    docker-compose start
else
    # Si no existen, verificar si el archivo .env existe
    if [ ! -f .env ]; then
        echo "El archivo .env no existe. Ejecute primero el script de instalación:"
        echo "./install.sh"
        exit 1
    fi
    
    # Iniciar los servicios
    echo "Iniciando servicios..."
    docker-compose up -d
fi

# Verificar si los contenedores están corriendo
if [ $(docker ps | grep openiotzen | wc -l) -eq 3 ]; then
    echo "\n¡Servicios iniciados con éxito!"
    echo "Frontend: http://localhost:9000"
    echo "Backend: http://localhost:3000"
    echo "Base de datos: localhost:5432"
    echo "\nPara detener los servicios, ejecuta: ./stop.sh"
else
    echo "\nHubo un problema al iniciar los servicios. Revisa los logs con: docker-compose logs"
fi
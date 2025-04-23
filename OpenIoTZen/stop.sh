#!/bin/bash

# Script para detener OpenIoTZen
echo "Deteniendo OpenIoTZen..."

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

# Verificar si los contenedores están corriendo
if [ $(docker ps | grep openiotzen | wc -l) -eq 0 ]; then
    echo "Los servicios de OpenIoTZen no están en ejecución."
    exit 0
fi

# Detener los servicios
echo "Deteniendo servicios..."
docker-compose stop

# Verificar si los contenedores se detuvieron
if [ $(docker ps | grep openiotzen | wc -l) -eq 0 ]; then
    echo "\n¡Servicios detenidos con éxito!"
    echo "Para iniciar los servicios nuevamente, ejecuta: ./start.sh"
else
    echo "\nHubo un problema al detener los servicios. Intenta con: docker-compose down"
fi
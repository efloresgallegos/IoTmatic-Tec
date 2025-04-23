#!/bin/bash

# Script de instalación para OpenIoTZen
echo "Iniciando instalación de OpenIoTZen..."

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

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "Creando archivo .env..."
    echo "AI_API_KEY=tu_api_key_de_openai" > .env
    echo "DEEPSEEK_API_KEY=tu_api_key_de_deepseek" >> .env
    echo "\nPor favor, edita el archivo .env y configura tus claves de API antes de continuar."
    echo "Presiona Enter cuando hayas terminado..."
    read
fi

# Construir y levantar los contenedores
echo "Construyendo y levantando los contenedores..."
docker-compose up -d --build

# Verificar si los contenedores están corriendo
if [ $(docker ps | grep openiotzen | wc -l) -eq 3 ]; then
    echo "\n¡Instalación completada con éxito!"
    echo "Frontend: http://localhost:9000"
    echo "Backend: http://localhost:3000"
    echo "Base de datos: localhost:5432"
    echo "\nPara detener los servicios, ejecuta: docker-compose down"
    echo "Para reiniciar los servicios, ejecuta: docker-compose restart"
else
    echo "\nHubo un problema con la instalación. Revisa los logs con: docker-compose logs"
fi
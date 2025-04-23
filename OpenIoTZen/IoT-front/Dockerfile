# Dockerfile para el frontend de OpenIoTZen
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Instalar servidor ligero para servir la aplicación
RUN npm install -g serve

# Exponer puerto
EXPOSE 9000

# Comando para iniciar la aplicación
CMD ["serve", "-s", "dist", "-l", "9000"]
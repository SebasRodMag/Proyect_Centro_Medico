FROM node:20-alpine

WORKDIR /app

# Copia solo package.json y package-lock.json primero para aprovechar el cache de capas
COPY package.json package-lock.json ./ 

# Instala las dependencias de Node.js
RUN npm install

# Copia el resto de tu aplicación Angular
COPY . .

# Expone el puerto por defecto de Angular CLI
EXPOSE 4200

# Comando para iniciar el servidor de desarrollo de Angular
CMD ["npm", "start"]
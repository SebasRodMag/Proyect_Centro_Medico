FROM node:24-slim

WORKDIR /app

COPY package*.json ./

# Limpia el caché de npm, elimina package-lock.json y fuerza la instalación de todas las dependencias
RUN rm -f package-lock.json \
    && npm cache clean --force \
    && npm install -g @angular/cli \
    && npm install --legacy-peer-deps --force

COPY . .

# Puerto 4200 para desarrollo con ng serve
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]

FROM node:24-slim

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli \
    && npm install

COPY . .

# Puerto 4200 para desarrollo con ng serve
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]

FROM node:24-slim

WORKDIR /app

COPY package*.json ./

# Clear npm cache, set npm registry and retry options, then install
RUN rm -f package-lock.json\
    && npm cache clean --force\
    && npm install -g @angular/cli\
    && npm install --legacy-peer-deps --force
COPY . .

# Puerto 4200 para desarrollo con ng serve
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]


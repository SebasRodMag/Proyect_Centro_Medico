FROM node:24-slim as builder

WORKDIR /app

COPY . .

RUN npm install && npm run build --prod

# Copia solo la carpeta compilada al destino final
FROM nginx:alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html

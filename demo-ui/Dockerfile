# Build Stage
FROM node:18-alpine as builder
WORKDIR /app
COPY demo-ui/package*.json ./
RUN npm install
COPY demo-ui .
RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

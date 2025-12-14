FROM node:18-alpine

WORKDIR /app

# Copy client and install dependencies
COPY feature-flag-client ./feature-flag-client
WORKDIR /app/feature-flag-client
RUN npm install && npm run build

# Setup service
WORKDIR /app/service
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "run", "start:prod"]

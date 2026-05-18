FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm install -g serve

ARG VITE_HOST_IP
ENV VITE_HOST_IP=$VITE_HOST_IP

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
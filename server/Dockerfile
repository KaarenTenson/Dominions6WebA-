FROM node:22.22.3-alpine3.22


WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["node", "dist/index.js"]
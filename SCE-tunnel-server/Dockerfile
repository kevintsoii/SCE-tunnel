FROM node:20-alpine

WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/

RUN npm install

COPY . /app

ENV NODE_ENV production
ENV DEBUG *

EXPOSE 5000

ENTRYPOINT ["node", "deploy.js", "--port", "5000"]
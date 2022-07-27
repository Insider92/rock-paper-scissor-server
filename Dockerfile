
FROM node:14.17.0-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY .eslintrc.js tsconfig.json tsconfig.build.json ./

CMD [ "npm", "run", "start:docker"]
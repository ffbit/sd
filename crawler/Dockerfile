# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=prod
COPY . .

## Add the wait script to the image
# https://github.com/ufoscout/docker-compose-wait
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait


CMD ["sh", "-c", "/wait && node crawler.js"]

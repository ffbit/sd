# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=prod
COPY . .
ENV PAGE_GEN=false
ENV PAGE_DIR='./generated'
ENV PAGE_NUM=10000
ENV PAGE_MIN_EDGES=8
ENV PAGE_MAX_EDGES=16
RUN ["ls", "-l"]
RUN ["npm", "run-script", "generate"]
RUN ["ls", "-l"]
RUN ["env"]

ENV PORT=3000
EXPOSE $PORT

CMD ["node", "app.js"]

FROM node:alpine
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
CMD ["sh", "./scripts/start-docker-dev.sh"]

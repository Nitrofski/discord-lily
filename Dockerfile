FROM node:11-slim
WORKDIR /usr/src/discord-lily

# Install application dependencies
COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]

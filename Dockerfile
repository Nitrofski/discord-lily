FROM node:11
WORKDIR /usr/src/discord-lily

ADD http://lilypond.org/download/binaries/linux-64/lilypond-2.18.2-1.linux-64.sh ./
RUN sh lilypond-2.18.2-1.linux-64.sh --batch

# TODO: Setup lilypond JAIL account and directory and stuff.

# Install application dependencies
COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]

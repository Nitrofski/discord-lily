FROM node:11-slim

RUN apt-get update && apt-get install -y bzip2

RUN cd /tmp \
  && (wget -q http://lilypond.org/download/binaries/linux-64/lilypond-2.18.2-1.linux-64.sh \
    && sh lilypond-2.18.2-1.linux-64.sh --batch \
    && rm lilypond-2.18.2-1.linux-64.sh)

WORKDIR /usr/local/src/discord-lily

# Install application dependencies
COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]

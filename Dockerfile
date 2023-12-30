
FROM  node:17.3-alpine3.12

# Create app directory
WORKDIR /usr/src/app

# Copy package.json AND package-lock.json
COPY package*.json ./

# To build for arm32 we need to build sqlite3 seperatly
# First we remove it from our application, build it from source, then re-install it.
RUN apk add --no-cache g++ git jq make python3 sqlite sqlite-dev \
  && NODE_SQLITE_VERSION=5.1.6 \
  && npm un sqlite3 -S \
  && npm i --production \
  && wget https://github.com/mapbox/node-sqlite3/archive/v${NODE_SQLITE_VERSION}.zip -O /usr/src/app/sqlite3.zip \
  && mkdir -p /usr/src/app/sqlite3 \
  && unzip /usr/src/app/sqlite3.zip -d /usr/src/app/sqlite3 \
  && cd /usr/src/app/sqlite3/node-sqlite3-${NODE_SQLITE_VERSION} \
  && npm install --build-from-source --sqlite=/usr/bin  \
  && mv /usr/src/app/sqlite3/node-sqlite3-${NODE_SQLITE_VERSION} /usr/src/app/node_modules/sqlite3 \
  && npm install -g /usr/src/app/node_modules/sqlite3 \
  && apk del g++ git jq make python3 \
  && rm -Rf /usr/src/app/sqlite3 /usr/src/app/sqlite3.zip

# Copy the rest of the source data
COPY . .

ENV PORT=${PORT:-3000}
ENV LOG_PATH=${LOG_PATH:-/usr/src/app/logs}
ENV UPDATE_RATE=${UPDATE_RATE:-300}
ENV LOG_RETENTION_PERIOD=${LOG_RETENTION_PERIOD:-604800}

# Create a folder to put log files
RUN mkdir -p ${LOG_PATH}

EXPOSE $PORT
CMD [ "node", "server.js" ]
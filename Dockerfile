
FROM  node:17.3-alpine3.12

# Create app directory
WORKDIR /usr/src/app

# Copy package.json AND package-lock.json
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Copy the rest of the source data
COPY . .

ENV PORT=${PORT:-3000}
ENV LOG_PATH=${LOG_PATH:-/usr/src/app/logs}

# Create a folder to put log files
RUN mkdir -p ${LOG_PATH}

EXPOSE $PORT
CMD [ "node", "server.js" ]
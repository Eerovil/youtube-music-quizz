FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

# Install frontend
WORKDIR /usr/src/app
COPY frontend ./
WORKDIR /usr/src/app/frontend

# Build frontend to public
# Remove frontend folder to delete all build time
# stuff and keep the image size small
RUN yarn install && \
    npm run build && \
    cd .. && \
    rm -rf frontend

# Bundle app source (this copies frontend also but whatever)
COPY . .

ENTRYPOINT ["npm", "start"]

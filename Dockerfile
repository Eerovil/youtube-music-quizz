FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

# Install frontend
WORKDIR /usr/src/app/frontend
COPY frontend/package*.json ./
COPY frontend/yarn.lock ./

# Build frontend and copy to public
# Remove frontend folder to delete all build time
# stuff and keep the image size small
RUN yarn install && \
    npm run build && \
    cp -r dist/* ../public/ && \
    rm -rf dist && \
    cd .. && \
    rm -rf frontend

# Bundle app source (this copies frontend also but whatever)
COPY . .

ENTRYPOINT ["npm", "start"]

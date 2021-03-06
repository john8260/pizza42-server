FROM node:12

# Change working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm production packages 
RUN npm install

COPY . .

ENV PORT 3001

EXPOSE 3001

USER node

CMD ["npm", "start"]

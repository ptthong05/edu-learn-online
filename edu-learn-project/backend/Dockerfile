FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install

# Copy all backend source code including SQLite database
COPY . .

EXPOSE 5000

CMD ["node", "index.js"]

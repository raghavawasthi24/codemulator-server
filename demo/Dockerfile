FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Render expects a port to be exposed
EXPOSE 8081

# Start the application
CMD ["node", "server.js"]

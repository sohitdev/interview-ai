FROM ghcr.io/puppeteer/puppeteer:latest

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

# Switch to root user to install dependencies if needed, but puppeteer image has a `pptruser`
USER root

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Ensure correct permissions
RUN chown -R pptruser:pptruser /app

# Switch back to the non-privileged user for security
USER pptruser

EXPOSE 3000

CMD ["node", "server.js"]

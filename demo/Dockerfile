FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app
RUN chown -R pptruser:pptruser /app

COPY --chown=pptruser:pptruser package*.json ./

USER pptruser
RUN npm install

COPY --chown=pptruser:pptruser . .

ENV PORT=8081
EXPOSE 8081

CMD ["node", "server.js"]

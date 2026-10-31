FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node server.mjs package.json index.html chaos.css chaos.js ./
COPY --chown=node:node assets ./assets
USER node
CMD ["node", "server.mjs"]

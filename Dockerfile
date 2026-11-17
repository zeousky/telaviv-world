FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node lunar ./lunar
COPY --chown=node:node server.mjs ./
USER node
CMD ["node", "server.mjs"]

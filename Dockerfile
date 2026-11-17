FROM node:24-alpine AS build
WORKDIR /app
COPY build-record.mjs ./
COPY record-data ./record-data
COPY record-assets ./record-assets
RUN node build-record.mjs

FROM node:24-alpine
WORKDIR /app
COPY --from=build --chown=node:node /app/record-public ./record-public
COPY --chown=node:node server.mjs ./
USER node
CMD ["node", "server.mjs"]

FROM node:20.8 AS builder

WORKDIR /app

COPY --from=datadog/serverless-init:1 /datadog-init /app/datadog-init
COPY --from=datadog/dd-lib-js-init /operator-build/node_modules /dd_tracer/node/

COPY . .

RUN npm install
RUN npm run build

FROM node:20.8 AS dev

WORKDIR /app

ENV NODE_ENV=development

EXPOSE 3000

CMD ["sh", "-c", "npm install; npm run dev"]

FROM builder AS prod

ENV DD_SERVICE=hackathon
ENV DD_ENV=prod
ENV DD_VERSION=1
ENV DD_SITE=datadoghq.eu
ENV DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true

EXPOSE 3000

ENTRYPOINT ["/app/datadog-init"]

CMD ["npm", "run", "start"]
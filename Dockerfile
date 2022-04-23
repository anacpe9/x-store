FROM registry.gitlab.com/dtac-receipt-hub/node:16-alpine-builder AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN NODE_ENV=development yarn install --frozen-lockfile

COPY . .
RUN NODE_ENV=development yarn run build

RUN sed -i 's/.\/..\/..\/package.json/.\/..\/package.json/g' dist/common/constants.js
RUN NODE_ENV=production yarn install  --frozen-lockfile --production
RUN find ./ -type f -name '*.d.ts' -delete
RUN find ./ -type f -name '*.js.map' -delete

FROM registry.gitlab.com/dtac-receipt-hub/node:16-alpine
LABEL maintainer="Anucha Nualsi <ana.cpe9@gmail.com>"

WORKDIR /app
ENV TZ="Asia/Bangkok"
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules/
COPY --from=build /app/dist ./

EXPOSE 3000
CMD ["node", "main.js"]
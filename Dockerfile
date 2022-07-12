FROM node:16.15
WORKDIR /app
COPY ./package.json ./
RUN yarn install
RUN yarn prisma generate
COPY . .
COPY tsconfig.json ./
CMD ["yarn", "start:prod"]

FROM node:16.15.0
WORKDIR /app
COPY ./package.json ./
COPY .env ./
RUN yarn install
RUN yarn prisma generate
COPY . .
COPY tsconfig.json ./
COPY ./prisma ./
EXPOSE 3000
CMD ["yarn", "start:prod"]

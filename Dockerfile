FROM amd64/node:16.16.0
WORKDIR /app
COPY ./package.json ./
COPY ./prisma ./
COPY ./tsconfig.json ./
COPY ./tsconfig.build.json ./
RUN yarn install
RUN yarn prisma generate
RUN yarn build
COPY . .

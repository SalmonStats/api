include .env

.PHONY: dev
dev:
	yarn start:dev

.PHONY: prod
prod:
	yarn start:prod

.PHONY: init
init:
	cp .env.sample .env

.PHONY: build
build:
	docker build -t tkgling/salmon-stats-app:${API_VER} .

.PHONY: push
push:
	docker push tkgling/salmon-stats-app:${API_VER}

.PHONY: db
db:
	docker run --rm \
	-p 5432:5432 \
	-e POSTGRES_USER=tkgstrator \
	-e POSTGRES_PASSWORD=123456 \
	-e POSTGRES_DB=sp2dev \
	postgres:14.4 

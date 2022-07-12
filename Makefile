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
	-e POSTGRES_USER=linpostgres \
	-e POSTGRES_PASSWORD=1234567890 \
	-e POSTGRES_DB=splatoon2 \
	postgres:14.2

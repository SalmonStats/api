include .env.development

.PHONY: serve
serve:
	yarn start:dev

.PHONY: up
up:
	docker-compose --env-file .env.development up

.PHONY: start
start:
	docker-compose --env-file .env.development up -d

.PHONY: down
down:
	docker-compose --env-file .env.development down -v

.PHONY: build
build:
	docker build -t tkgling/salmon-stats-app:${API_VER} .

.PHONY: push
push:
	docker push tkgling/salmon-stats-app:${API_VER}

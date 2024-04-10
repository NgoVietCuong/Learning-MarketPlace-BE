# List running containers
ps:
	docker compose ps
# Build image and start containers
build:
	docker compose up -d --build
# Start containers
up:
	docker compose up -d
# Stop and remove containers
down:
	docker compose down -v
# Stop running containers without removing them
stop:
	docker compose stop
# Go to node container terminal
node:
	docker compose exec node sh
# Go to redis container terminal
redis:
	docker compose exec redis sh
# Install all dependencies in node container
install:
	docker compose exec node yarn install
# Start program in node container
dev:
	docker compose exec node yarn start:dev
# Compile nestjs code in node container into an output folder
buildNest:
	docker compose exec node yarn build
# Setup project with docker container
setup:
	make build
	docker compose exec node yarn global add @nestjs/cli
	make install
	make buildNest
# Create migration file
migrationCreate:
	docker compose exec node yarn migrate:create src/database/migrations/$(file)
# Run migration
migrate:
	docker compose exec node yarn migrate:run
# Revert migration
migrationRevert:
	docker compose exec node yarn migrate:revert
# Run seed database
seedRun:
	docker compose exec node yarn seed:run
# Run one seed class
seedRunOne:
	docker compose exec node yarn seed:runOne $(class)
# Generate module
genModule:
	docker compose exec node nest generate module modules/$(module)
# Generate controller
genController:
	docker compose exec node nest generate controller modules/$(module) --no-spec --flat
# Generate service
genService:
	docker compose exec node nest generate service modules/$(module) --no-spec --flat
# Add package
yarnAdd:
	docker compose exec node yarn add $(package)
# Remove package
yarnRemove:
	docker compose exec node yarn remove $(package)

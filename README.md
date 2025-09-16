# nutrifit

docker run -d --name nutrifit-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nutrifitdb -p 5432:5432 -v pgdata:/var/lib/postgresql/data postgres:16-alpine
docker run -d --name nutrifit-redis -p 6379:6379 -v redisdata:/data redis:7-alpine redis-server --appendonly yes

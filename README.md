## Backend part of [Chat app](https://github.com/NiFos/chat_app_frontend)

To start backend we need to start Hasura and functions (or start express).

### Requirements:

* Docker (docker-compose)

### Deploy locally

Hasura and Postgres:

​	1) Download hasura docker-compose [file](https://raw.githubusercontent.com/hasura/graphql-engine/stable/install-manifests/docker-compose/docker-compose.yaml)

​	2) Configure env how in [.env.hasura.example](https://github.com/NiFos/chat_app_functions/blob/master/.env.hasura.example)

​	3) Restore Postgres schema from [hasura-pg.sql](https://github.com/NiFos/chat_app_functions/blob/master/hasura-pq.sql)

REST api:

​	1) Configure .env file like [.env.example](https://github.com/NiFos/chat_app_functions/blob/master/.env.example)

​	2) You can deploy this on GCP functions or start local express server

​		2.1) For serverless create new project in gcp console and run: yarn deploy

​		2.2) If you want start it locally (or deploy express application) run: yarn start


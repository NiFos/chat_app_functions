FROM hasura/graphql-engine:latest
CMD graphql-engine \
  --database-url $DATABASE_URL \
  serve \
  --admin-secret $ADMIN_SECRET \
  --jwt-secret $JWT_SECRET \
  --unauthorized-role $UNAUTH_ROLE \
  --cors-domain $CORS_DOMAIN \
  --server-port $PORT \
  --enable-console
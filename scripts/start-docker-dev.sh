#!/bin/sh

DIR="$(cd "$(dirname "$0")" && pwd)"
echo '🟡 - Waiting for database to be ready...'
$DIR/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'

echo "Database url ${DATABASE_URL}"

yarn prisma:generate
yarn prisma:migrate:dev
yarn dev

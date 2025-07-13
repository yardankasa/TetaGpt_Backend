#!/bin/sh
# entrypoint.sh

echo "==> [Entrypoint] Applying database migrations..."
# اجرای اسکریپت deploy که در package.json تعریف کردیم
npm run prisma:deploy

echo "==> [Entrypoint] Starting application..."
# اجرای دستور اصلی (CMD)
exec "$@"

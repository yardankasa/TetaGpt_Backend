# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npx prisma generate # برای اطمینان از وجود کلاینت برای بیلد
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine
WORKDIR /usr/src/app

COPY . .
RUN npm install --only=production

# فایل‌های لازم را از مرحله build کپی می‌کنیم
# این شامل schema و migrations هم می‌شود
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma

# کلاینت نهایی را generate می‌کنیم
RUN npx prisma generate

EXPOSE 3000

# Entrypoint جدید و هوشمند
# COPY ./entrypoint.sh .

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start:prod"]

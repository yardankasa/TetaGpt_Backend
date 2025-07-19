FROM node:20-alpine

WORKDIR /usr/src/app

# فقط package.json را برای نصب وابستگی‌ها کپی می‌کنیم
COPY package*.json ./
RUN npm install
#RUN npx prisma generate
# دستور پیش‌فرض را برای اجرا در حالت watch قرار می‌دهیم
CMD ["npm", "run", "start:dev"]

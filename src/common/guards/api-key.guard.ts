import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key']; // کلید را از هدر 'x-api-key' می‌خوانیم

    const validApiKey = process.env.ADMIN_API_KEY; // کلید معتبر را از .env می‌خوانیم

    if (!validApiKey) {
      // اگر ادمین کلیدی در .env تعریف نکرده بود، برای امنیت همه را مسدود می‌کنیم
      console.error('ADMIN_API_KEY is not set in the environment variables.');
      throw new UnauthorizedException('Service not configured.');
    }

    if (apiKey === validApiKey) {
      return true; // اگر کلیدها مطابقت داشتند، اجازه عبور داده می‌شود
    } else {
      // اگر کلید اشتباه بود یا وجود نداشت، خطا می‌دهیم
      throw new UnauthorizedException('Invalid API Key.');
    }
  }
}

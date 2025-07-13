import { Injectable, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from 'src/encryption/encryption.service';
import { TokenLoginDto } from './dto/token-login.dto';

const MAX_LOGIN_ATTEMPTS = 3;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  async loginWithToken(tokenLoginDto: TokenLoginDto) {
    const { token } = tokenLoginDto;

    // --- این بخش کاملاً بازنویسی می‌شود ---

    // از یک تراکنش (transaction) استفاده می‌کنیم تا هر دو عملیات (خواندن و آپدیت)
    // به صورت یکپارچه انجام شوند و از race condition جلوگیری شود.
    const result = await this.prisma.$transaction(async (tx) => {
      // ۱. توکن دستوری را در دیتابیس پیدا کن
      const authToken = await tx.authToken.findUnique({
        where: { token },
        include: { openAiAccount: true },
      });

      // ۲. اعتبار اولیه توکن را بسنج
      if (!authToken || !authToken.isActive || authToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired token.');
      }

      // ۳. بررسی حد مجاز استفاده
      if (authToken.usageCount >= MAX_LOGIN_ATTEMPTS) {
        // اگر به حد مجاز رسیده، توکن را برای همیشه غیرفعال کن
        await tx.authToken.update({
          where: { id: authToken.id },
          data: { isActive: false },
        });
        throw new ForbiddenException('This token has reached its maximum login limit.');
      }

      // ۴. اگر همه چیز درست بود، تعداد استفاده را یکی اضافه کن
      const updatedAuthToken = await tx.authToken.update({
        where: { id: authToken.id },
        data: { 
          usageCount: { increment: 1 }, // به صورت اتمیک یکی اضافه می‌کند
          lastUsedAt: new Date(),
          // می‌توانیم اینجا user-agent را هم ذخیره کنیم اگر از درخواست گرفته شود
        },
      });

      // حالا بقیه منطق لاگین را با اطلاعات آپدیت شده انجام می‌دهیم
      const decryptedPassword = this.encryptionService.decrypt(authToken.openAiAccount.openaiPassword);
    
      const payload = { 
        sub: updatedAuthToken.id, 
        accountId: updatedAuthToken.openAiAccountId,
      };

      return {
        accessToken: this.jwtService.sign(payload),
        openAiCredentials: {
          username: authToken.openAiAccount.openaiUsername,
          password: decryptedPassword,
        },
        usageInfo: { // (اختیاری) اطلاعات مفیدی برای نمایش به کاربر
          count: updatedAuthToken.usageCount,
          max: MAX_LOGIN_ATTEMPTS,
        }
      };
    });

    return result;
  }

   async refreshToken(commandToken: string) {
    const authToken = await this.prisma.authToken.findUnique({
      where: { token: commandToken },
    });

    if (!authToken || !authToken.isActive || authToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired command token. Please login again.');
    }

    const payload = { 
      sub: authToken.id,
      accountId: authToken.openAiAccountId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

}

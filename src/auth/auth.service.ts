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

    const result = await this.prisma.$transaction(async (tx) => {
      // ۱. توکن را پیدا کن
      const authToken = await tx.authToken.findUnique({
        where: { token },
        include: { openAiAccount: true },
      });

      // ۲. اعتبار اولیه توکن را بسنج
      if (!authToken || !authToken.isActive || authToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired token.');
      }

      // ۳. (تغییر کلیدی) چک می‌کنیم که آیا تعداد استفاده *فعلی* به حد مجاز رسیده است یا خیر
      if (authToken.usageCount >= MAX_LOGIN_ATTEMPTS) {
          // حتی اگر رسیده بود، محض احتیاط آن را غیرفعال می‌کنیم و خطا می‌دهیم
          await tx.authToken.update({ where: { id: authToken.id }, data: { isActive: false } });
          throw new ForbiddenException('This token has reached its maximum login limit.');
      }

      // ۴. تعداد استفاده را یکی اضافه کن و اطلاعات آپدیت شده را در یک متغیر بگیر
      const updatedAuthToken = await tx.authToken.update({
        where: { id: authToken.id },
        data: { 
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
      
      // ۵. حالا چک می‌کنیم که آیا *بعد از* این آپدیت، تعداد استفاده از حد مجاز بیشتر شده است یا خیر
      // اگر این سومین استفاده بود، توکن را برای استفاده‌های بعدی غیرفعال می‌کنیم
      if (updatedAuthToken.usageCount >= MAX_LOGIN_ATTEMPTS) {
          await tx.authToken.update({
              where: { id: updatedAuthToken.id },
              data: { isActive: false }
          });
          console.log(`Token ${token} has reached its limit and is now deactivated.`);
      }

      // ۶. بقیه منطق مثل قبل
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
        usageInfo: {
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

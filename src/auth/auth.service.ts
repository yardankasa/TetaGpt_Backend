import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from 'src/encryption/encryption.service';
import { TokenLoginDto } from './dto/token-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  async loginWithToken(tokenLoginDto: TokenLoginDto) {
    const { token } = tokenLoginDto;

    // 1. توکن دستوری را در دیتابیس پیدا کن
    const authToken = await this.prisma.authToken.findUnique({
      where: { token },
      include: { openAiAccount: true }, // اطلاعات اکانت OpenAI متصل را هم بگیر
    });

    // 2. اعتبار توکن را بسنج
    if (!authToken || !authToken.isActive || authToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    // 3. اگر توکن معتبر بود، اطلاعات لازم را آماده کن
    const decryptedPassword = this.encryptionService.decrypt(authToken.openAiAccount.openaiPassword);
    
    const payload = { 
      sub: authToken.id, // Subject of the JWT is the AuthToken ID
      accountId: authToken.openAiAccountId,
    };

    // 4. یک JWT (توکن نشست) بساز و برگردان
    return {
      accessToken: this.jwtService.sign(payload),
      openAiCredentials: {
        username: authToken.openAiAccount.openaiUsername,
        password: decryptedPassword,
      },
    };
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

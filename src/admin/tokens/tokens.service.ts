import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { RenewTokenDto } from './dto/renew-token.dto';
import { randomBytes } from 'crypto'; // for generate random tokens

@Injectable()
export class TokensService {
  constructor(private prisma: PrismaService) {}

  async create(createTokenDto: CreateTokenDto) {
    const { openAiAccountId, durationInDays } = createTokenDto;

    // 1. we are test the openai account exists or not
    const account = await this.prisma.openAiAccount.findUnique({
      where: { id: openAiAccountId },
    });

    if (!account) {
      throw new NotFoundException(`OpenAI Account with ID ${openAiAccountId} not found.`);
    }

    // 2. generate a safe token
    const token = randomBytes(32).toString('hex');

    // 3. calculate expire date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationInDays);

    // 4. save new token at the db
    return this.prisma.authToken.create({
      data: {
        token,
        expiresAt,
        openAiAccountId,
      },
    });
  }

    async deactivate(token: string) {
    try {
      // توکن را بر اساس رشته توکن پیدا کرده و آن را غیرفعال می‌کنیم
      const updatedToken = await this.prisma.authToken.update({
        where: { token }, // با استفاده از unique field توکن
        data: { isActive: false },
      });
      return updatedToken;
    } catch (error) {
      // اگر توکنی با این رشته پیدا نشد، پریزما خطا می‌دهد
      if (error.code === 'P2025') {
        throw new NotFoundException(`AuthToken "${token}" not found.`);
      }
      throw error;
    }
  }

 async activate(token: string) {
    try {
      // توکن را بر اساس رشته توکن پیدا کرده و آن را غیرفعال می‌کنیم
      const updatedToken = await this.prisma.authToken.update({
        where: { token }, // با استفاده از unique field توکن
        data: { isActive: true },
      });
      return updatedToken;
    } catch (error) {
      // اگر توکنی با این رشته پیدا نشد، پریزما خطا می‌دهد
      if (error.code === 'P2025') {
        throw new NotFoundException(`AuthToken "${token}" not found.`);
      }
      throw error;
    }
  }


async renew(token: string, renewTokenDto: RenewTokenDto) {
    // ۱. ابتدا چک می‌کنیم که اصلاً توکنی با این رشته وجود دارد یا نه
    const existingToken = await this.prisma.authToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      throw new NotFoundException(`AuthToken "${token}" not found.`);
    }

    // ۲. تاریخ انقضای جدید را محاسبه می‌کنیم
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + renewTokenDto.durationInDays);

    // ۳. توکن را با تاریخ جدید آپدیت کرده و آن را دوباره فعال می‌کنیم
    const renewedToken = await this.prisma.authToken.update({
      where: { token },
      data: {
        expiresAt: newExpiresAt,
        isActive: true, // مهم: توکن را دوباره فعال می‌کنیم
        usageCount: 0,
      },
    });

    return renewedToken;
  }



async findOne(token: string) {
    const authToken = await this.prisma.authToken.findUnique({
      where: { token },
      include: { openAiAccount: { select: { friendlyName: true } } },
    });
    if (!authToken) {
      throw new NotFoundException(`AuthToken "${token}" not found.`);
    }
    return authToken;
  }


}

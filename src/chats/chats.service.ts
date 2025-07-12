import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  // برای ذخیره یک چت جدید
  // ما authTokenId را از کاربر (که توسط Guard استخراج شده) می‌گیریم
  create(createChatDto: CreateChatDto, authTokenId: string) {
    return this.prisma.chat.create({
      data: {
        ...createChatDto,
        authTokenId: authTokenId,
      },
    });
  }

  // برای گرفتن تاریخچه چت‌های یک کاربر
  findAllForUser(authTokenId: string) {
    return this.prisma.chat.findMany({
      where: { authTokenId },
      orderBy: {
        createdAt: 'desc', // چت‌های جدیدتر را اول نشان بده
      },
    });
  }
async remove(openaiChatId: string, authTokenId: string) {
    // چت را بر اساس ترکیب منحصر به فرد chatId و authTokenId پیدا می‌کنیم
    const chat = await this.prisma.chat.findUnique({
      where: {
        chatId_authTokenId: { // این سینتکس برای composite unique key است
          chatId: openaiChatId,
          authTokenId: authTokenId,
        },
      },
    });

    // اگر چتی با این مشخصات برای این کاربر پیدا نشد، خطا می‌دهیم
    if (!chat) {
      throw new NotFoundException(`Chat with OpenAI ID ${openaiChatId} not found for this user.`);
    }

    // حالا با استفاده از ID داخلی دیتابیس که پیدا کردیم، آن را حذف می‌کنیم
    await this.prisma.chat.delete({
      where: { id: chat.id },
    });

    return { message: `Chat with OpenAI ID ${openaiChatId} has been deleted.` };
  }
}

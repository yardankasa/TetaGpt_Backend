import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto'; // <-- import جدید



@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  // برای ذخیره یک چت جدید
  // ما authTokenId را از کاربر (که توسط Guard استخراج شده) می‌گیریم


async create(createChatDto: CreateChatDto, authTokenId: string) {
    // ۱. داده‌ها را از DTO استخراج می‌کنیم
    const { chatId, title, groupId: clientGroupId } = createChatDto;
    
    // ۲. یک آبجکت برای داده‌های اصلی چت می‌سازیم
    const chatCreateData: any = {
        chatId,
        title,
        authToken: {
            connect: { id: authTokenId } // همیشه به کاربر فعلی متصل است
        }
    };

    // ۳. اگر کلاینت یک groupId فرستاده بود، رابطه با گروه را هم اضافه می‌کنیم
    if (clientGroupId) {
      // ابتدا ID داخلی گروه را پیدا می‌کنیم
      const group = await this.prisma.group.findUnique({
        where: {
          groupId_authTokenId: {
            groupId: clientGroupId,
            authTokenId,
          },
        },
        select: { id: true },
      });

      if (!group) {
        throw new NotFoundException(`Group with client-ID "${clientGroupId}" not found for this user.`);
      }

      // حالا به آبجکت داده‌هایمان، اتصال به گروه را اضافه می‌کنیم
      chatCreateData.group = {
        connect: { id: group.id } // <-- با استفاده از ID داخلی (UUID)
      };
    }

    // ۴. در نهایت، چت را با داده‌های کامل می‌سازیم
    return this.prisma.chat.create({
      data: chatCreateData,
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
    // از deleteMany استفاده می‌کنیم تا مستقیماً با ‌های ترکیبی حذف کنیم
    const result = await this.prisma.chat.deleteMany({
      where: {
        // هر دو شرط باید برقرار باشند تا حذف انجام شود:
        // ۱. chatId باید مطابقت داشته باشد
        chatId: openaiChatId, 
        // ۲. و آن چت باید به کاربر فعلی (که از توکن JWT آمده) تعلق داشته باشد
        authTokenId: authTokenId,
      },
    });

    // result.count تعداد رکوردهایی که حذف شده‌اند را برمی‌گرداند.
    // اگر این عدد 0 باشد، یعنی هیچ چتی با این مشخصات برای این کاربر پیدا و حذف نشده است.
    if (result.count === 0) {
      throw new NotFoundException(`Chat with OpenAI ID "${openaiChatId}" not found for this user, or you don't have permission to delete it.`);
    }
    
    // اگر حداقل یک رکورد حذف شده باشد، عملیات موفقیت‌آمیز بوده
    return { message: `Chat with ID ${openaiChatId} has been successfully deleted.` };
  }



async update(chatIdToUpdate: string, updateChatDto: UpdateChatDto, authTokenIdOfUser: string) {
    // برای امنیت، ابتدا چک می‌کنیم که چتی با این ID متعلق به این کاربر وجود دارد یا نه
    const chatExists = await this.prisma.chat.findFirst({
      where: {
        chatId: chatIdToUpdate, // با استفاده از openai chat id
        authTokenId: authTokenIdOfUser,
      },
    });

    if (!chatExists) {
      throw new NotFoundException(`Chat with ID ${chatIdToUpdate} not found for this user.`);
    }

    // حالا که از مالکیت مطمئن شدیم، با استفاده از ID داخلی دیتابیس، آن را آپدیت می‌کنیم
    return this.prisma.chat.update({
      where: {
        id: chatExists.id,
      },
      data: {
        title: updateChatDto.title,
      },
    });
  }




}

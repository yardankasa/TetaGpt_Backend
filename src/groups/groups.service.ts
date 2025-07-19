import { Injectable, NotFoundException  } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateGroupDto } from './dto/update-group.dto'; // <-- این خط را اضافه کنید
import { CreateGroupDto } from './dto/create-group.dto';


@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  create(createGroupDto: CreateGroupDto, authTokenId: string) {
    // --- بخش اصلاح شده ---
    // ما تمام مقادیر (groupId و title) را از DTO می‌خوانیم
    return this.prisma.group.create({
      data: {
        title: createGroupDto.title,
        groupId: createGroupDto.groupId,
        authTokenId: authTokenId,
      },
    });
  }

  findAllForUser(authTokenId: string) {
    return this.prisma.group.findMany({
      where: { authTokenId },
      include: {
        chats: {
          select: {
            id: true,
            chatId: true,
            title: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  remove(groupIdToDelete: string, authTokenIdOfUser: string) {
    // --- بخش اصلاح شده ---
    // برای جلوگیری از ابهام، نام پارامترها را عوض می‌کنیم
    return this.prisma.group.deleteMany({
      where: {
        // به طور صریح می‌گوییم: فیلد groupId در دیتابیس باید برابر با پارامتر ورودی باشد
        groupId: groupIdToDelete,
        authTokenId: authTokenIdOfUser,
      },
    });
  }


async update(groupIdToUpdate: string, updateGroupDto: UpdateGroupDto, authTokenIdOfUser: string) {
    // ابتدا چک می‌کنیم که گروهی با این ID برای این کاربر وجود دارد
    const groupExists = await this.prisma.group.findFirst({
        where: {
            groupId: groupIdToUpdate,
            authTokenId: authTokenIdOfUser
        }
    });

    if(!groupExists) {
        throw new NotFoundException(`Group with ID ${groupIdToUpdate} not found for this user.`);
    }

    return this.prisma.group.update({
      where: {
        // آپدیت بر اساس ID داخلی دیتابیس انجام می‌شود که پیدا کرده‌ایم
        id: groupExists.id
      },
      data: {
        title: updateGroupDto.title,
      },
    });
  }
}

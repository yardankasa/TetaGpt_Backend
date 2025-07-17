import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  create(createGroupDto: CreateGroupDto, authTokenId: string) {
    return this.prisma.group.create({
      data: {
        title: createGroupDto.title,
        authTokenId: authTokenId,
      },
    });
  }

  // تمام گروه‌های یک کاربر را با چت‌های داخلشان برمی‌گرداند
  findAllForUser(authTokenId: string) {
    return this.prisma.group.findMany({
      where: { authTokenId },
      include: {
        chats: { // چت‌های داخل هر گروه را هم می‌گیریم
          select: { // فقط فیلدهای لازم از چت را انتخاب می‌کنیم
            id: true,
            chatId: true,
            title: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  remove(id: string, authTokenId: string) {
    // برای حذف، ابتدا باید چک کنیم که این گروه متعلق به این کاربر است.
    // این کار با یک کوئری deleteMany که هر دو شرط را دارد انجام می‌شود.
    return this.prisma.group.deleteMany({
      where: {
        id,
        authTokenId,
      },
    });
  }
}
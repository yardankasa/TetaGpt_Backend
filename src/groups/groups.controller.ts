import { Controller, Get, Post, Body, Delete, Param, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // تمام مسیرهای این کنترلر با JWT محافظت می‌شوند
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    const user = req.user;
    return this.groupsService.create(createGroupDto, user.authTokenId);
  }

  @Get()
  findAll(@Request() req) {
    const user = req.user;
    return this.groupsService.findAllForUser(user.authTokenId);
  }
  
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const user = req.user;
    const result = await this.groupsService.remove(id, user.authTokenId);
    // deleteMany تعداد رکوردهای حذف شده را برمی‌گرداند.
    // اگر 0 باشد یعنی گروهی با این ID برای این کاربر وجود نداشته.
    if (result.count === 0) {
      throw new NotFoundException(`Group with ID ${id} not found or you don't have permission.`);
    }
    return { message: 'Group deleted successfully.' };
  }
}
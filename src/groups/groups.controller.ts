import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request, Patch, NotFoundException } from '@nestjs/common'; // <-- Patch اضافه شد

import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto'; 
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
// endpoint جدید برای حذف بر اساس groupId
  @Delete(':groupId') 
  async remove(@Param('groupId') groupId: string, @Request() req) {
    const user = req.user;
    // سرویس را تغییر می‌دهیم تا با groupId کار کند
    const result = await this.groupsService.remove(groupId, user.authTokenId);

    if (result.count === 0) {
      throw new NotFoundException(`Group with ID ${groupId} not found for this user.`);
    }
    return { message: 'Group deleted successfully.' };
  }



@Patch(':groupId')
  update(
    @Param('groupId') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.groupsService.update(groupId, updateGroupDto, user.authTokenId);
  }

}

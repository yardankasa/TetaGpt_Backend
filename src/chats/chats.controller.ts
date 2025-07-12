import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'; // 1. گارد جدید را import کنید

@Controller('chats')
@UseGuards(JwtAuthGuard) // 2. این گارد را روی کل کنترلر اعمال کنید
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto, @Request() req) {
    // req.user توسط JwtStrategy ما ساخته شده است
    const user = req.user; 
    return this.chatsService.create(createChatDto, user.authTokenId);
  }

  @Get()
  findAll(@Request() req) {
    const user = req.user;
    return this.chatsService.findAllForUser(user.authTokenId);
  }
  
 @Delete(':chatId') 
  @HttpCode(HttpStatus.OK)
  remove(@Param('chatId') chatId: string, @Request() req) {
    const user = req.user;
    return this.chatsService.remove(chatId, user.authTokenId);
  }

}

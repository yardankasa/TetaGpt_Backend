import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { EncryptionModule } from './encryption/encryption.module';
import { ChatsModule } from './chats/chats.module';

@Module({
  imports: [PrismaModule, AdminModule, AuthModule, EncryptionModule, ChatsModule], // مطمئن شوید این دو ماژول اینجا هستند
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // این ماژول را گلوبال می‌کند
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // سرویس را export می‌کند
})
export class PrismaModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // این را اضافه کنید

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ValidationPipe را فعال کنید
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();

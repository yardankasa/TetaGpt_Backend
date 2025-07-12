import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  content: object;
}

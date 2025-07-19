import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  title: string;
  
  @IsString()
  @IsOptional()
  groupId?: string; 
}

import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UpdateChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200) // می‌توانید یک محدودیت طول برای عنوان چت بگذارید
  @IsOptional()
  title?: string;
}

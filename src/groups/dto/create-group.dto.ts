import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  groupId: string; // <-- فیلد جدید اضافه شد

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;
}

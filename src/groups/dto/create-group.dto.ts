// src/groups/dto/create-group.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;
}
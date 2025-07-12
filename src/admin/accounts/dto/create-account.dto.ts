import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  friendlyName: string;

  @IsString()
  @IsNotEmpty()
  openaiUsername: string;

  @IsString()
  @IsNotEmpty()
  openaiPassword: string;

  @IsObject()
  @IsOptional()
  proxyInfo?: object;
}

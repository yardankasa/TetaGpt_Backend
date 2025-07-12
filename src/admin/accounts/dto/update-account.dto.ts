import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  friendlyName?: string;

  @IsString()
  @IsOptional()
  openaiUsername?: string;

  @IsString()
  @IsOptional()
  openaiPassword?: string;

  @IsObject()
  @IsOptional()
  proxyInfo?: object;
}

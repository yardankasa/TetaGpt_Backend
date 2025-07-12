import { IsString, IsNotEmpty } from 'class-validator';

export class TokenLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string; // ordered token
}

import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  openAiAccountId: string; // realted openai account

  @IsInt()
  @Min(1) // at least one day crideit
  durationInDays: number;  // duration of token 
}


import { IsInt, Min } from 'class-validator';

export class RenewTokenDto {
  @IsInt()
  @Min(1) // حداقل باید برای 1 روز تمدید شود
  durationInDays: number;
}

import { IsString, MinLength } from 'class-validator';

export class QuickPatientDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(8)
  phone: string;
}

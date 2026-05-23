import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePregnancyDto {
  @IsDateString()
  lmpDate: string;

  @IsOptional()
  @IsString()
  riskLevel?: string;
}

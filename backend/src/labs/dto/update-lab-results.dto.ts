import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LabStatus } from '@prisma/client';

export class UpdateLabResultsDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  normalRange?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(LabStatus)
  status?: LabStatus;
}

import { IsArray, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreatePrescriptionDto {
  @IsUUID()
  visitId: string;

  @IsUUID()
  patientId: string;

  @IsArray()
  medications: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;
}

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsArray()
  medications: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  pregnancyMonthMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  pregnancyMonthMax?: number;

  /** للمشرف عند إنشاء قالب لطبيب محدد */
  @IsOptional()
  @IsUUID()
  doctorId?: string;
}

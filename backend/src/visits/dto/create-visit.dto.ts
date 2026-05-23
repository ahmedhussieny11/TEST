import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { VisitType } from '@prisma/client';

export class CreateVisitDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsEnum(VisitType)
  type: VisitType;

  @IsOptional()
  @IsString()
  complaint?: string;

  @IsOptional()
  @IsString()
  examination?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  pregnancyNotes?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  doctorId?: string;
}

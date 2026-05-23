import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AppointmentStatus, VisitType } from '@prisma/client';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsString()
  date: string;

  @IsString()
  time: string;

  @IsEnum(VisitType)
  type: VisitType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsString()
  bookingSource?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  /** عند false لا يُضاف للطابور تلقائياً (حتى يتم الدفع) */
  @IsOptional()
  @IsBoolean()
  autoQueue?: boolean;
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  status?: string;
}

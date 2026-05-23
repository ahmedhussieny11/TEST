import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isPregnant?: boolean;

  @IsOptional()
  @IsInt()
  pregnancyWeek?: number;

  @IsOptional()
  medicalHistory?: Record<string, unknown>;

  @IsOptional()
  emergencyContact?: Record<string, unknown>;
}

export class UpdatePatientDto extends CreatePatientDto {}

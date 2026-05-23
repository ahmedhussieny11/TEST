import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLabDto {
  @IsUUID()
  patientId: string;

  @IsString()
  testName: string;

  @IsOptional()
  @IsUUID()
  visitId?: string;
}

import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadMedicalDto {
  @IsIn(['lab', 'sonar'])
  category: 'lab' | 'sonar';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  testName?: string;
}

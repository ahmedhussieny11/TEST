import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole, AttachmentType } from '@prisma/client';
import { FilesService } from './files.service';
import { FilesGateway } from './files.gateway';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(
    private files: FilesService,
    private filesGateway: FilesGateway,
  ) {}

  @Post('upload')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('patientId') patientId: string,
    @Query('visitId') visitId?: string,
    @Query('type') type?: AttachmentType,
  ) {
    const attachment = await this.files.upload(file, patientId, visitId, type);
    this.filesGateway.emitPatientFilesUpdated(patientId);
    return attachment;
  }

  @Get('patient/:patientId')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  findByPatient(@Param('patientId') patientId: string) {
    return this.files.findByPatient(patientId);
  }
}

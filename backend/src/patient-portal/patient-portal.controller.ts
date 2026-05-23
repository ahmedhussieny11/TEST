import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientPortalService } from './patient-portal.service';
import { PatientJwtGuard } from './patient-jwt.guard';
import { UpdatePatientProfileDto } from './dto/update-profile.dto';
import { UploadMedicalDto } from './dto/upload-medical.dto';

@Controller('patient')
export class PatientPortalController {
  constructor(private portal: PatientPortalService) {}

  @Post('login')
  login(@Body('phone') phone: string) {
    return this.portal.login(phone);
  }

  @Post('register')
  register(
    @Body()
    body: {
      name: string;
      phone: string;
      email?: string;
      age?: number;
      address?: string;
    },
  ) {
    return this.portal.register(body);
  }

  @Get('doctors')
  doctors() {
    return this.portal.getDoctors();
  }

  @Get('me')
  @UseGuards(PatientJwtGuard)
  me(@Req() req: { patient: { id: string } }) {
    return this.portal.getPatientData(req.patient.id);
  }

  @Patch('profile')
  @UseGuards(PatientJwtGuard)
  updateProfile(
    @Req() req: { patient: { id: string } },
    @Body() body: UpdatePatientProfileDto,
  ) {
    return this.portal.updateProfile(req.patient.id, body);
  }

  @Get('queue-status')
  @UseGuards(PatientJwtGuard)
  queueStatus(@Req() req: { patient: { id: string } }) {
    return this.portal.getQueueStatus(req.patient.id);
  }

  @Post('appointments')
  @UseGuards(PatientJwtGuard)
  book(
    @Req() req: { patient: { id: string } },
    @Body() body: { doctorId: string; date: string; time: string; serviceId?: string },
  ) {
    return this.portal.bookAppointment(req.patient.id, body);
  }

  @Post('appointments/:id/cancel')
  @UseGuards(PatientJwtGuard)
  cancel(@Req() req: { patient: { id: string } }, @Param('id') id: string) {
    return this.portal.cancelAppointment(req.patient.id, id);
  }

  @Post('uploads')
  @UseGuards(PatientJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadMedical(
    @Req() req: { patient: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadMedicalDto,
  ) {
    return this.portal.uploadPatientMedicalFile(
      req.patient.id,
      file,
      body.category,
      body.testName,
    );
  }

  @Get('my-uploads')
  @UseGuards(PatientJwtGuard)
  myUploads(@Req() req: { patient: { id: string } }) {
    return this.portal.listMyUploads(req.patient.id);
  }

  @Delete('lab-tests/:id/upload')
  @UseGuards(PatientJwtGuard)
  deleteLabUpload(@Req() req: { patient: { id: string } }, @Param('id') id: string) {
    return this.portal.deletePatientLabUpload(req.patient.id, id);
  }

  @Post('lab-tests/:id/replace')
  @UseGuards(PatientJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  replaceLabUpload(
    @Req() req: { patient: { id: string } },
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.portal.replacePatientLabUpload(req.patient.id, id, file);
  }

  @Delete('attachments/:id')
  @UseGuards(PatientJwtGuard)
  deleteAttachment(
    @Req() req: { patient: { id: string } },
    @Param('id') id: string,
  ) {
    return this.portal.deletePatientAttachment(req.patient.id, id);
  }

  @Post('attachments/:id/replace')
  @UseGuards(PatientJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  replaceAttachment(
    @Req() req: { patient: { id: string } },
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.portal.replacePatientAttachment(req.patient.id, id, file);
  }

  @Post('lab-tests/:id/upload')
  @UseGuards(PatientJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadLab(
    @Req() req: { patient: { id: string } },
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.portal.uploadLabResult(req.patient.id, id, file);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, CreateTemplateDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private prescriptions: PrescriptionsService) {}

  @Get('prescriptions')
  @Roles(UserRole.doctor, UserRole.admin, UserRole.reception)
  findAll(@Query('patientId') patientId?: string) {
    return this.prescriptions.findAll(patientId);
  }

  @Get('prescriptions/:id')
  @Roles(UserRole.doctor, UserRole.admin, UserRole.reception)
  findOne(@Param('id') id: string) {
    return this.prescriptions.findOne(id);
  }

  @Post('prescriptions')
  @Roles(UserRole.doctor, UserRole.admin)
  create(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: { id: string }) {
    return this.prescriptions.create(dto, user.id);
  }

  @Get('prescription-templates/suggested')
  @Roles(UserRole.doctor, UserRole.admin)
  suggestedTemplates(
    @CurrentUser() user: { id: string; role: UserRole },
    @Query('pregnancyMonth') pregnancyMonth?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    const month = pregnancyMonth ? parseInt(pregnancyMonth, 10) : undefined;
    const effectiveDoctorId = doctorId ?? user.id;
    return this.prescriptions.getSuggestedTemplates(effectiveDoctorId, month);
  }

  @Get('prescription-templates')
  @Roles(UserRole.doctor, UserRole.admin)
  templates(
    @CurrentUser() user: { id: string; role: UserRole },
    @Query('doctorId') doctorId?: string,
  ) {
    return this.prescriptions.getTemplatesForUser(user.id, user.role, doctorId);
  }

  @Post('prescription-templates')
  @Roles(UserRole.doctor, UserRole.admin)
  createTemplate(
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptions.createTemplate(dto, user.id, user.role);
  }

  @Patch('prescription-templates/:id')
  @Roles(UserRole.doctor, UserRole.admin)
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptions.updateTemplate(id, dto, user.id, user.role);
  }

  @Delete('prescription-templates/:id')
  @Roles(UserRole.doctor, UserRole.admin)
  deleteTemplate(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptions.deleteTemplate(id, user.id, user.role);
  }
}

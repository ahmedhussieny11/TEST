import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/create-patient.dto';
import { QuickPatientDto } from './dto/quick-patient.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private patients: PatientsService) {}

  @Get()
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  findAll(@Query('search') search?: string) {
    return this.patients.findAll(search);
  }

  @Get(':id/timeline')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  timeline(@Param('id') id: string) {
    return this.patients.getTimeline(id);
  }

  @Get(':id')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  findOne(@Param('id') id: string) {
    return this.patients.findOne(id);
  }

  @Post('quick')
  @Roles(UserRole.reception, UserRole.admin, UserRole.doctor)
  quickRegister(@Body() dto: QuickPatientDto) {
    return this.patients.findOrCreateQuick(dto.name, dto.phone);
  }

  @Post()
  @Roles(UserRole.reception, UserRole.admin, UserRole.doctor)
  create(@Body() dto: CreatePatientDto) {
    return this.patients.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.reception, UserRole.admin, UserRole.doctor)
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, dto);
  }
}

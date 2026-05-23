import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PregnanciesService } from './pregnancies.service';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('patients/:patientId/pregnancies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PregnanciesController {
  constructor(private pregnancies: PregnanciesService) {}

  @Get()
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  findAll(@Param('patientId') patientId: string) {
    return this.pregnancies.findByPatient(patientId);
  }

  @Post()
  @Roles(UserRole.doctor, UserRole.admin)
  create(@Param('patientId') patientId: string, @Body() dto: CreatePregnancyDto) {
    return this.pregnancies.create(patientId, dto);
  }
}

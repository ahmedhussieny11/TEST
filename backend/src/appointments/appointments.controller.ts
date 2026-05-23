import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  @Get()
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    return this.appointments.findAll(from, to, doctorId);
  }

  @Get('today')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  today() {
    return this.appointments.getToday();
  }

  @Get(':id')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  findOne(@Param('id') id: string) {
    return this.appointments.findOne(id);
  }

  @Post()
  @Roles(UserRole.reception, UserRole.admin, UserRole.doctor)
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointments.create(dto);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.reception, UserRole.admin)
  confirm(@Param('id') id: string) {
    return this.appointments.confirm(id);
  }

  @Patch(':id')
  @Roles(UserRole.reception, UserRole.admin, UserRole.doctor)
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointments.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.reception, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.appointments.remove(id);
  }
}

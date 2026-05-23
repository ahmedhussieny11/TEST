import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitsController {
  constructor(private visits: VisitsService) {}

  @Get()
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  findAll(@Query('patientId') patientId?: string) {
    return this.visits.findAll(patientId);
  }

  @Get(':id')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  findOne(@Param('id') id: string) {
    return this.visits.findOne(id);
  }

  @Post()
  @Roles(UserRole.doctor, UserRole.admin)
  create(@Body() dto: CreateVisitDto, @CurrentUser() user: { id: string }) {
    return this.visits.create(dto, user.id);
  }
}

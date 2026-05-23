import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { LabsService } from './labs.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabResultsDto } from './dto/update-lab-results.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('lab-tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabsController {
  constructor(private labs: LabsService) {}

  @Get()
  @Roles(UserRole.doctor, UserRole.admin, UserRole.reception)
  findAll(@Query('status') status?: string, @Query('patientId') patientId?: string) {
    return this.labs.findAll(status, patientId);
  }

  @Post()
  @Roles(UserRole.doctor, UserRole.admin, UserRole.reception)
  create(@Body() dto: CreateLabDto, @CurrentUser() user: { id: string }) {
    return this.labs.create(dto, user.id);
  }

  @Patch(':id/results')
  @Roles(UserRole.doctor, UserRole.admin, UserRole.reception)
  updateResults(@Param('id') id: string, @Body() dto: UpdateLabResultsDto) {
    return this.labs.updateResults(id, dto);
  }
}

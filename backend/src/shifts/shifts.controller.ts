import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private shifts: ShiftsService) {}

  @Get('open')
  @Roles(UserRole.reception, UserRole.admin)
  getOpen(@CurrentUser() user: { id: string }) {
    return this.shifts.getOpenShift(user.id);
  }

  @Post('open')
  @Roles(UserRole.reception, UserRole.admin)
  open(@CurrentUser() user: { id: string }, @Body('openingBalance') openingBalance: number) {
    return this.shifts.openShift(user.id, openingBalance ?? 0);
  }

  @Post(':id/close')
  @Roles(UserRole.reception, UserRole.admin)
  close(
    @Param('id') id: string,
    @Body('actualCash') actualCash: number,
    @Body('notes') notes?: string,
  ) {
    return this.shifts.closeShift(id, actualCash, notes);
  }

  @Get(':id/daily-report')
  @Roles(UserRole.reception, UserRole.admin)
  report(@Param('id') id: string) {
    return this.shifts.dailyReport(id);
  }
}

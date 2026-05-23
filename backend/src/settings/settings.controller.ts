import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.reception, UserRole.doctor)
  get() {
    return this.settings.get();
  }

  @Patch()
  @Roles(UserRole.admin, UserRole.doctor)
  update(@Body() body: Record<string, unknown>) {
    return this.settings.update(body as never);
  }
}

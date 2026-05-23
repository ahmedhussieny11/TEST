import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { QuickCaptureService } from './quick-capture.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('quick-capture')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuickCaptureController {
  constructor(private quickCapture: QuickCaptureService) {}

  @Post('session')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  createSession(
    @Body() body: { patientId: string; visitId?: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.quickCapture.createSession({
      patientId: body.patientId,
      visitId: body.visitId,
      createdById: user.id,
    });
  }
}

import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { QueueStatus, UserRole } from '@prisma/client';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { QueueGateway } from './queue.gateway';

@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueueController {
  constructor(
    private queue: QueueService,
    private gateway: QueueGateway,
  ) {}

  @Get('today')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  async today() {
    const data = await this.queue.getTodayQueue();
    this.gateway.emitQueueUpdate();
    return data;
  }

  @Post('check-in/:appointmentId')
  @Roles(UserRole.reception, UserRole.admin)
  async checkIn(@Param('appointmentId') appointmentId: string) {
    const entry = await this.queue.checkIn(appointmentId);
    this.gateway.emitQueueUpdate();
    return entry;
  }

  @Patch(':id/status')
  @Roles(UserRole.doctor, UserRole.reception, UserRole.admin)
  async updateStatus(@Param('id') id: string, @Body('status') status: QueueStatus) {
    const entry = await this.queue.updateStatus(id, status);
    this.gateway.emitQueueUpdate();
    return entry;
  }
}

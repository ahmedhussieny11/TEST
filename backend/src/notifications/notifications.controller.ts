import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  @Roles(UserRole.doctor, UserRole.admin, UserRole.reception)
  async list() {
    const [items, unreadCount] = await Promise.all([
      this.notifications.findRecent(25),
      this.notifications.countUnread(),
    ]);
    return { items, unreadCount };
  }

  @Patch('read-all')
  @Roles(UserRole.doctor, UserRole.admin, UserRole.reception)
  markAllRead() {
    return this.notifications.markAllRead();
  }

  @Patch(':id/read')
  @Roles(UserRole.doctor, UserRole.admin, UserRole.reception)
  markRead(@Param('id') id: string) {
    return this.notifications.markRead(id);
  }
}

import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { QueueModule } from '../queue/queue.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [QueueModule, BillingModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

import { Module } from '@nestjs/common';
import { BookingPublicService } from './booking-public.service';
import { BookingPublicController } from './booking-public.controller';
import { AppointmentsModule } from '../appointments/appointments.module';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [AppointmentsModule, PatientsModule],
  controllers: [BookingPublicController],
  providers: [BookingPublicService],
  exports: [BookingPublicService],
})
export class BookingPublicModule {}

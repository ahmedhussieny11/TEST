import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientPortalService } from './patient-portal.service';
import { PatientPortalController } from './patient-portal.controller';
import { PatientJwtGuard } from './patient-jwt.guard';
import { AppointmentsModule } from '../appointments/appointments.module';
import { BookingPublicModule } from '../booking-public/booking-public.module';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { QueueModule } from '../queue/queue.module';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    AppointmentsModule,
    BookingPublicModule,
    FilesModule,
    NotificationsModule,
    QueueModule,
    PatientsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [PatientPortalController],
  providers: [PatientPortalService, PatientJwtGuard],
})
export class PatientPortalModule {}

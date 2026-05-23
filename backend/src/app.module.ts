import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { PregnanciesModule } from './pregnancies/pregnancies.module';
import { VisitsModule } from './visits/visits.module';
import { FilesModule } from './files/files.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { QueueModule } from './queue/queue.module';
import { BillingModule } from './billing/billing.module';
import { ShiftsModule } from './shifts/shifts.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LabsModule } from './labs/labs.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { PatientPortalModule } from './patient-portal/patient-portal.module';
import { BookingPublicModule } from './booking-public/booking-public.module';
import { NotificationsModule } from './notifications/notifications.module';
import { QuickCaptureModule } from './quick-capture/quick-capture.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PatientsModule,
    PregnanciesModule,
    VisitsModule,
    FilesModule,
    AppointmentsModule,
    QueueModule,
    BillingModule,
    ShiftsModule,
    PrescriptionsModule,
    DashboardModule,
    LabsModule,
    UsersModule,
    SettingsModule,
    PatientPortalModule,
    BookingPublicModule,
    NotificationsModule,
    QuickCaptureModule,
  ],
})
export class AppModule {}

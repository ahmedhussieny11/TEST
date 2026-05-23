import { Module } from '@nestjs/common';
import { QuickCaptureService } from './quick-capture.service';
import { QuickCaptureController } from './quick-capture.controller';
import { QuickCapturePublicController } from './quick-capture-public.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [QuickCaptureController, QuickCapturePublicController],
  providers: [QuickCaptureService],
})
export class QuickCaptureModule {}

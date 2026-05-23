import { Module } from '@nestjs/common';
import { PregnanciesService } from './pregnancies.service';
import { PregnanciesController } from './pregnancies.controller';

@Module({
  controllers: [PregnanciesController],
  providers: [PregnanciesService],
  exports: [PregnanciesService],
})
export class PregnanciesModule {}

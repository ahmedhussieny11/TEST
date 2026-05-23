import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FilesGateway } from './files.gateway';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesGateway],
  exports: [FilesService, FilesGateway],
})
export class FilesModule {}

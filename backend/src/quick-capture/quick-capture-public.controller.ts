import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuickCaptureService } from './quick-capture.service';

@Controller('public/quick-capture')
export class QuickCapturePublicController {
  constructor(private quickCapture: QuickCaptureService) {}

  @Get(':code')
  getInfo(@Param('code') code: string) {
    return this.quickCapture.getSessionInfo(code);
  }

  @Post(':code/upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@Param('code') code: string, @UploadedFile() file: Express.Multer.File) {
    return this.quickCapture.uploadViaSession(code, file);
  }
}

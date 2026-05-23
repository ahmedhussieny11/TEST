import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookingPublicService } from './booking-public.service';

@Controller('public/booking')
export class BookingPublicController {
  constructor(private booking: BookingPublicService) {}

  @Get('config')
  getConfig() {
    return this.booking.getConfig();
  }

  @Get('slots')
  getSlots(@Query('date') date: string, @Query('doctorId') doctorId?: string) {
    return this.booking.getAvailableSlots(date, doctorId);
  }

  @Post()
  guestBook(
    @Body()
    body: {
      name: string;
      phone: string;
      email?: string;
      serviceId: string;
      date: string;
      time: string;
      doctorId?: string;
    },
  ) {
    return this.booking.guestBook(body);
  }
}

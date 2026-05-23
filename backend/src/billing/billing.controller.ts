import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, AddPaymentDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ShiftsService } from '../shifts/shifts.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(
    private billing: BillingService,
    private shifts: ShiftsService,
  ) {}

  @Get('services')
  @Roles(UserRole.reception, UserRole.admin, UserRole.doctor)
  services() {
    return this.billing.getServices();
  }

  @Get('invoices')
  @Roles(UserRole.reception, UserRole.admin)
  invoices() {
    return this.billing.findAllInvoices();
  }

  @Post('invoices')
  @Roles(UserRole.reception, UserRole.admin)
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: { id: string },
  ) {
    const shift = await this.shifts.getOpenShift(user.id);
    return this.billing.createInvoice(dto, user.id, shift?.id);
  }

  @Post('invoices/:id/payments')
  @Roles(UserRole.reception, UserRole.admin)
  async addPayment(
    @Param('id') id: string,
    @Body() dto: AddPaymentDto,
    @CurrentUser() user: { id: string },
  ) {
    const shift = await this.shifts.getOpenShift(user.id);
    return this.billing.collectPayment(id, dto, shift?.id);
  }
}

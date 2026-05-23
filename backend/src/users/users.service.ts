import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateUserDto) {
    if (dto.role === UserRole.patient) {
      throw new BadRequestException('لا يمكن إنشاء حساب مريضة من هنا');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        passwordHash,
        role: dto.role,
      },
      select: userSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    if (dto.role === UserRole.patient) {
      throw new BadRequestException('دور غير صالح');
    }

    if (dto.email && dto.email !== user.email) {
      const taken = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (taken) throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً');
    }

    if (dto.role && dto.role !== user.role && user.role === UserRole.admin) {
      const adminCount = await this.prisma.user.count({ where: { role: UserRole.admin } });
      if (adminCount <= 1) {
        throw new BadRequestException('لا يمكن تغيير دور آخر مشرف في النظام');
      }
    }

    if (id === currentUserId && dto.role && dto.role !== UserRole.admin) {
      throw new BadRequestException('لا يمكنك تغيير دور حسابك');
    }

    const data: {
      name?: string;
      email?: string;
      phone?: string | null;
      role?: UserRole;
      passwordHash?: string;
    } = {};

    if (dto.name != null) data.name = dto.name.trim();
    if (dto.email != null) data.email = dto.email.trim().toLowerCase();
    if (dto.phone !== undefined) data.phone = dto.phone?.trim() || null;
    if (dto.role != null) data.role = dto.role;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('لا يمكنك حذف حسابك');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    if (user.role === UserRole.admin) {
      const adminCount = await this.prisma.user.count({ where: { role: UserRole.admin } });
      if (adminCount <= 1) {
        throw new BadRequestException('لا يمكن حذف آخر مشرف في النظام');
      }
    }

    try {
      await this.prisma.user.delete({ where: { id } });
      return { ok: true };
    } catch {
      throw new BadRequestException(
        'تعذر الحذف — المستخدم مرتبط بمواعيد أو سجلات. عطّلي الحساب أو انقلي البيانات أولاً.',
      );
    }
  }
}

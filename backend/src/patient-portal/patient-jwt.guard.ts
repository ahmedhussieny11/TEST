import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PatientJwtGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();
    try {
      const payload = this.jwt.verify(auth.slice(7), {
        secret: this.config.get('JWT_SECRET'),
      });
      if (payload.type !== 'patient') throw new UnauthorizedException();
      request.patient = { id: payload.sub, phone: payload.phone };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

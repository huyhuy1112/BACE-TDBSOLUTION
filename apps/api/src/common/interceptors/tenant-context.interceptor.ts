import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { tenantStorage } from '../tenant/tenant-context';

type AuthUser = {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
};

/**
 * Binds tenant ALS for the entire request pipeline after JWT auth.
 * Guards alone cannot reliably propagate AsyncLocalStorage into controllers.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user?.tenantId || !user.userId) {
      throw new UnauthorizedException('Tenant context required');
    }

    return new Observable((subscriber) => {
      tenantStorage.run(
        {
          tenantId: user.tenantId,
          userId: user.userId,
          roles: user.roles ?? [],
          permissions: user.permissions ?? [],
        },
        () => {
          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}

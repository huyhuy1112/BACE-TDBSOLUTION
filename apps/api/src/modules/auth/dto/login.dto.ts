import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  /** Optional when user belongs to multiple tenants later */
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

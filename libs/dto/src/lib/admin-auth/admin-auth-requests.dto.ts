import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

// NIST SP 800-63B: length, not composition rules. The maximum bounds Argon2 work per request.
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

// Emails are stored lowercase (CHK_admin_user_email_lowercase), so they are compared that way.
const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginRequestDto {
  @ApiProperty({ format: 'email', maxLength: 254 })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  // No minimum here: the login response must not reveal the password policy.
  @ApiProperty({ maxLength: PASSWORD_MAX_LENGTH })
  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}

export class MfaLoginRequestDto {
  @ApiProperty({ description: 'The mfaToken from a login that returned status mfa_required' })
  @IsString()
  mfaToken!: string;

  @ApiProperty({ pattern: '^\\d{6}$', description: 'Six-digit code from the authenticator app' })
  @Matches(/^\d{6}$/)
  code!: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({ format: 'email', maxLength: 254 })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({ description: 'The token from the password reset link' })
  @IsString()
  @MaxLength(100)
  token!: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}

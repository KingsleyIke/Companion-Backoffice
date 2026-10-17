import { ApiProperty } from '@nestjs/swagger';
import { ADMIN_ROLES, ADMIN_STATUSES, type AdminRole, type AdminStatus } from '@companion/entities';

export const LOGIN_STATUSES = ['authenticated', 'mfa_required'] as const;
export type LoginStatus = (typeof LOGIN_STATUSES)[number];

export class AdminProfileDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ADMIN_ROLES, enumName: 'AdminRole' })
  role!: AdminRole;

  @ApiProperty({ format: 'uuid', type: String, nullable: true })
  dioceseScopeId!: string | null;

  @ApiProperty({ enum: ADMIN_STATUSES, enumName: 'AdminStatus' })
  status!: AdminStatus;
}

// The refresh token is never in a body: it travels only in the httpOnly cookie.
export class AuthSessionDto {
  @ApiProperty({ description: 'Bearer token for the Authorization header; keep it in memory only' })
  accessToken!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  accessTokenExpiresAt!: string;

  @ApiProperty({ type: AdminProfileDto })
  admin!: AdminProfileDto;
}

export class LoginResultDto {
  @ApiProperty({ enum: LOGIN_STATUSES, enumName: 'LoginStatus' })
  status!: LoginStatus;

  @ApiProperty({ type: AuthSessionDto, nullable: true, description: 'Set when authenticated' })
  session!: AuthSessionDto | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Set when mfa_required: send it with the code to /login/mfa within 5 minutes',
  })
  mfaToken!: string | null;
}

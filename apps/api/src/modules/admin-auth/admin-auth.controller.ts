import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiAcceptedResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  authConfig,
  CurrentAdmin,
  environmentConfig,
  Public,
  type AuthConfig,
  type AuthenticatedAdmin,
  type Environment,
} from '@companion/common';
import {
  AdminProfileDto,
  AuthSessionDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  LoginResultDto,
  MfaLoginRequestDto,
  ResetPasswordRequestDto,
} from '@companion/dto';

import { API_PREFIX } from '../../app/configure-app';
import { AdminAuthService } from './admin-auth.service';
import { PasswordResetService } from './password-reset.service';
import {
  ADMIN_AUTH_ROUTE,
  type AuthHttpRequest,
  type CookieOptions,
  type CookieResponse,
  CSRF_HEADER,
  CSRF_HEADER_VALUE,
  CsrfHeaderGuard,
  REFRESH_COOKIE,
  refreshCookieOptions,
  requestContext,
} from './auth-http';

const MINUTE_MS = 60_000;
const SIGN_IN_LIMITS = {
  account: { limit: 5, ttl: 15 * MINUTE_MS },
  address: { limit: 20, ttl: 15 * MINUTE_MS },
};
const CSRF_HEADER_DOC = { name: CSRF_HEADER, required: true, enum: [CSRF_HEADER_VALUE] };

// Rate limits: 'address' (client IP) applies to every route here; 'account' (IP + email) only
// to the sign-in routes. Limits are per API instance until throttling moves to Redis (1.2.6).
@ApiTags('admin-auth')
@Controller(ADMIN_AUTH_ROUTE)
@UseGuards(ThrottlerGuard)
@SkipThrottle({ account: true })
@ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
export class AdminAuthController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly auth: AdminAuthService,
    private readonly passwordResets: PasswordResetService,
    @Inject(environmentConfig.KEY) environment: Environment,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
  ) {
    this.cookieOptions = refreshCookieOptions(environment.nodeEnv, API_PREFIX);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @SkipThrottle({ account: false })
  @Throttle(SIGN_IN_LIMITS)
  @ApiOperation({
    operationId: 'adminLogin',
    summary: 'Sign in with email and password',
    description: 'Super admins get status mfa_required and must complete /login/mfa.',
  })
  @ApiOkResponse({ type: LoginResultDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(
    @Body() body: LoginRequestDto,
    @Req() request: AuthHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<LoginResultDto> {
    const signIn = await this.auth.login(body, requestContext(request));
    this.setRefreshCookie(response, signIn.refreshToken);
    return signIn.body;
  }

  @Public()
  @Post('login/mfa')
  @HttpCode(200)
  @SkipThrottle({ account: false })
  @Throttle(SIGN_IN_LIMITS)
  @ApiOperation({
    operationId: 'adminLoginMfa',
    summary: 'Complete a super admin sign-in with a TOTP code',
  })
  @ApiOkResponse({ type: AuthSessionDto })
  @ApiUnauthorizedResponse({ description: 'Expired MFA token or invalid code' })
  async loginMfa(
    @Body() body: MfaLoginRequestDto,
    @Req() request: AuthHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<AuthSessionDto> {
    const signIn = await this.auth.completeMfaLogin(body, requestContext(request));
    this.setRefreshCookie(response, signIn.refreshToken);
    return signIn.body;
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @UseGuards(CsrfHeaderGuard)
  @Throttle({ address: { limit: 30, ttl: MINUTE_MS } })
  @ApiOperation({
    operationId: 'adminRefresh',
    summary: 'Exchange the refresh cookie for a new access token and a rotated cookie',
  })
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiHeader(CSRF_HEADER_DOC)
  @ApiOkResponse({ type: AuthSessionDto })
  @ApiUnauthorizedResponse({ description: 'Missing, expired, revoked or reused refresh token' })
  @ApiForbiddenResponse({ description: `Missing ${CSRF_HEADER} header` })
  async refresh(
    @Req() request: AuthHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<AuthSessionDto> {
    const signIn = await this.auth.refresh(
      request.cookies[REFRESH_COOKIE],
      requestContext(request),
    );
    this.setRefreshCookie(response, signIn.refreshToken);
    return signIn.body;
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  @UseGuards(CsrfHeaderGuard)
  @ApiOperation({ operationId: 'adminLogout', summary: "End this device's session" })
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiHeader(CSRF_HEADER_DOC)
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: `Missing ${CSRF_HEADER} header` })
  async logout(
    @Req() request: AuthHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<void> {
    await this.auth.logout(request.cookies[REFRESH_COOKIE], requestContext(request));
    response.clearCookie(REFRESH_COOKIE, this.cookieOptions);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(202)
  @Throttle({ address: { limit: 3, ttl: 60 * MINUTE_MS } })
  @ApiOperation({
    operationId: 'adminForgotPassword',
    summary: 'Email a password reset link',
    description: 'Always 202, whether or not the email belongs to an admin.',
  })
  @ApiAcceptedResponse()
  async forgotPassword(
    @Body() { email }: ForgotPasswordRequestDto,
    @Req() request: AuthHttpRequest,
  ): Promise<void> {
    await this.passwordResets.request(email, requestContext(request));
  }

  @Public()
  @Post('reset-password')
  @HttpCode(204)
  @Throttle({ address: { limit: 10, ttl: 60 * MINUTE_MS } })
  @ApiOperation({
    operationId: 'adminResetPassword',
    summary: 'Set a new password with a reset link token; ends every session',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description: 'Invalid or expired reset link, or a password that breaks the policy',
  })
  async resetPassword(
    @Body() { token, password }: ResetPasswordRequestDto,
    @Req() request: AuthHttpRequest,
  ): Promise<void> {
    await this.passwordResets.reset(token, password, requestContext(request));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ operationId: 'adminMe', summary: 'The signed-in admin' })
  @ApiOkResponse({ type: AdminProfileDto })
  @ApiUnauthorizedResponse()
  me(@CurrentAdmin() admin: AuthenticatedAdmin): Promise<AdminProfileDto> {
    return this.auth.me(admin.id);
  }

  private setRefreshCookie(response: CookieResponse, refreshToken: string | null): void {
    if (refreshToken) {
      response.cookie(REFRESH_COOKIE, refreshToken, {
        ...this.cookieOptions,
        maxAge: this.config.refreshTokenTtlDays * 86_400_000,
      });
    }
  }
}

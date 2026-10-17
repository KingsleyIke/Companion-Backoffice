import { Logger } from '@nestjs/common';
import type { NodeEnv } from '@companion/common';

export interface PasswordResetMessage {
  adminId: string;
  to: string;
  resetUrl: string;
}

export abstract class PasswordResetMailer {
  abstract send(message: PasswordResetMessage): Promise<void>;
}

// Development and test only. Logs the link (it carries a live token) but never the address.
class LoggingPasswordResetMailer extends PasswordResetMailer {
  private readonly logger = new Logger('PasswordResetMailer');

  async send({ adminId, resetUrl }: PasswordResetMessage): Promise<void> {
    this.logger.log(`Password reset link for admin ${adminId}: ${resetUrl}`);
  }
}

// No email provider is chosen yet. Staging and production refuse to start rather than accept
// reset requests that could never be delivered.
export function createPasswordResetMailer(nodeEnv: NodeEnv): PasswordResetMailer {
  if (nodeEnv === 'staging' || nodeEnv === 'production') {
    throw new Error(
      'No password reset mailer is configured for staging or production: choose an email provider (task 1.1.5 follow-up)',
    );
  }
  return new LoggingPasswordResetMailer();
}

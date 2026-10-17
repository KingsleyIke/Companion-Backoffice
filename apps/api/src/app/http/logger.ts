import { ConsoleLogger } from '@nestjs/common';
import { LOG_LEVELS, type Environment } from '@companion/common';

// JSON lines where logs are collected (staging, production); readable colour locally.
export function createLogger({ nodeEnv, observability }: Environment): ConsoleLogger {
  const deployed = nodeEnv === 'staging' || nodeEnv === 'production';
  return new ConsoleLogger({
    json: deployed,
    colors: !deployed,
    logLevels: LOG_LEVELS.slice(0, LOG_LEVELS.indexOf(observability.logLevel) + 1),
  });
}

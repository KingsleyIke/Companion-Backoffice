import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

// Every route requires an access token unless it opts out with @Public().
export const Public = () => SetMetadata(IS_PUBLIC, true);

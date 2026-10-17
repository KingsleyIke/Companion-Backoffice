import type { ErrorEvent } from '@sentry/nestjs';

import { scrubEvent } from './sentry';

describe('scrubEvent', () => {
  it('drops cookies, headers, bodies, query strings and the user before sending', () => {
    const event: ErrorEvent = {
      type: undefined,
      request: {
        method: 'POST',
        url: 'https://api.example.org/api/v1/admin/auth/login?email=ada@example.org',
        cookies: { cc_admin_refresh: 'secret-refresh-token' },
        headers: { authorization: 'Bearer secret', 'user-agent': 'Browser' },
        data: { email: 'ada@example.org', password: 'secret' },
        query_string: 'email=ada@example.org',
      },
      user: { email: 'ada@example.org', ip_address: '203.0.113.7' },
    };

    const scrubbed = scrubEvent(event);

    expect(scrubbed.request).toEqual({
      method: 'POST',
      url: 'https://api.example.org/api/v1/admin/auth/login',
    });
    expect(scrubbed.user).toBeUndefined();
    expect(JSON.stringify(scrubbed)).not.toMatch(/secret|ada@example|203\.0\.113/);
  });
});

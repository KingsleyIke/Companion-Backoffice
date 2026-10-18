import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ForgotPasswordPage } from './forgot-password-page';
import { ResetPasswordPage } from './reset-password-page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

function setUp<T>(component: new () => T) {
  TestBed.configureTestingModule({
    imports: [component],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    fixture: TestBed.createComponent(component),
    http: TestBed.inject(HttpTestingController),
  };
}

function helpers(fixture: ComponentFixture<unknown>) {
  const element = () => fixture.nativeElement as HTMLElement;
  return {
    text: () => element().textContent ?? '',
    alert: () => element().querySelector('[role="alert"]')?.textContent?.trim(),
    type: (name: string, value: string) => {
      const input = element().querySelector<HTMLInputElement>(`input[formControlName="${name}"]`);
      if (!input) throw new Error(`no ${name}`);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    },
    submit: async () => {
      element().querySelector('form')?.dispatchEvent(new Event('submit'));
      await settle();
      fixture.detectChanges();
    },
  };
}

describe('ForgotPasswordPage', () => {
  it('confirms the same way whatever the email', async () => {
    const { fixture, http } = setUp(ForgotPasswordPage);
    fixture.detectChanges();
    const page = helpers(fixture);

    page.type('email', 'anyone@test.invalid');
    await page.submit();
    const request = http.expectOne('/api/v1/admin/auth/forgot-password');
    expect(request.request.body).toEqual({ email: 'anyone@test.invalid' });
    request.flush(null, { status: 202, statusText: 'Accepted' });
    await settle();
    fixture.detectChanges();

    expect(page.text()).toContain('If that email belongs to an admin account');
    http.verify();
  });
});

describe('ResetPasswordPage', () => {
  const withToken = () => {
    const setup = setUp(ResetPasswordPage);
    setup.fixture.componentRef.setInput('token', 'reset-token');
    setup.fixture.detectChanges();
    return { ...setup, page: helpers(setup.fixture) };
  };

  it('explains an incomplete link', () => {
    const { fixture } = setUp(ResetPasswordPage);
    fixture.detectChanges();
    expect(helpers(fixture).alert()).toBe('This reset link is incomplete. Request a new one.');
  });

  it('checks length and confirmation before calling the API', async () => {
    const { page, http } = withToken();
    page.type('password', 'too short');
    page.type('confirmation', 'too short');
    await page.submit();
    expect(page.alert()).toBe('Use at least 12 characters.');

    page.type('password', 'a long new passphrase');
    page.type('confirmation', 'a different passphrase');
    await page.submit();
    expect(page.alert()).toBe('The passwords do not match.');
    http.verify();
  });

  it('sets the password, or explains an expired link', async () => {
    const { fixture, page, http } = withToken();
    page.type('password', 'a long new passphrase');
    page.type('confirmation', 'a long new passphrase');

    await page.submit();
    http
      .expectOne('/api/v1/admin/auth/reset-password')
      .flush(
        { message: 'Invalid or expired reset link' },
        { status: 400, statusText: 'Bad Request' },
      );
    await settle();
    fixture.detectChanges();
    expect(page.alert()).toBe('This reset link is invalid or has expired. Request a new one.');

    await page.submit();
    const request = http.expectOne('/api/v1/admin/auth/reset-password');
    expect(request.request.body).toEqual({
      token: 'reset-token',
      password: 'a long new passphrase',
    });
    request.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    fixture.detectChanges();
    expect(page.text()).toContain("you're signed out everywhere");
  });
});

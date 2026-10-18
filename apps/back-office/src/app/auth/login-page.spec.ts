import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthSession, type SignInStep } from './auth-session';
import { LoginPage } from './login-page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  const signIn = jest.fn<Promise<SignInStep>, [string, string]>();
  const completeMfa = jest.fn<Promise<void>, [string, string]>();
  let navigateByUrl: jest.SpyInstance;

  const element = () => fixture.nativeElement as HTMLElement;
  const type = (selector: string, value: string) => {
    const input = element().querySelector<HTMLInputElement>(selector);
    if (!input) throw new Error(`no ${selector}`);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = async () => {
    element().querySelector('form')?.dispatchEvent(new Event('submit'));
    await settle();
    fixture.detectChanges();
  };
  const alertText = () => element().querySelector('[role="alert"]')?.textContent?.trim();

  beforeEach(() => {
    signIn.mockReset();
    completeMfa.mockReset();
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthSession, useValue: { signIn, completeMfa } }],
    });
    navigateByUrl = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginPage);
    fixture.componentRef.setInput('returnUrl', '/dioceses');
    fixture.detectChanges();
  });

  it('asks for both fields before calling the API', async () => {
    await submit();
    expect(alertText()).toBe('Please enter your email and password.');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('signs in and returns to the page the admin wanted', async () => {
    signIn.mockResolvedValue({ kind: 'signed-in' });
    type('input[formControlName="email"]', 'ada@test.invalid');
    type('input[formControlName="password"]', 'secret passphrase');
    await submit();
    expect(signIn).toHaveBeenCalledWith('ada@test.invalid', 'secret passphrase');
    expect(navigateByUrl).toHaveBeenCalledWith('/dioceses');
  });

  it('shows the API message for wrong credentials and a friendly one when rate-limited', async () => {
    type('input[formControlName="email"]', 'ada@test.invalid');
    type('input[formControlName="password"]', 'wrong');
    signIn.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 401, error: { message: 'Invalid email or password' } }),
    );
    await submit();
    expect(alertText()).toBe('Invalid email or password');

    signIn.mockRejectedValueOnce(new HttpErrorResponse({ status: 429 }));
    await submit();
    expect(alertText()).toBe('Too many attempts. Wait a few minutes, then try again.');
  });

  it('goes to the home page when the link carried no return address', async () => {
    fixture.componentRef.setInput('returnUrl', undefined);
    signIn.mockResolvedValue({ kind: 'signed-in' });
    type('input[formControlName="email"]', 'ada@test.invalid');
    type('input[formControlName="password"]', 'secret passphrase');
    await submit();
    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('moves a super admin to the code step, then signs in', async () => {
    signIn.mockResolvedValue({ kind: 'mfa-required', mfaToken: 'mfa-1' });
    completeMfa.mockResolvedValue();
    type('input[formControlName="email"]', 'root@test.invalid');
    type('input[formControlName="password"]', 'secret passphrase');
    await submit();

    expect(element().textContent).toContain('six-digit code');
    type('input[formControlName="code"]', '12345');
    await submit();
    expect(alertText()).toBe('Enter the six-digit code from your authenticator app.');

    type('input[formControlName="code"]', '123456');
    await submit();
    expect(completeMfa).toHaveBeenCalledWith('mfa-1', '123456');
    expect(navigateByUrl).toHaveBeenCalledWith('/dioceses');
  });
});

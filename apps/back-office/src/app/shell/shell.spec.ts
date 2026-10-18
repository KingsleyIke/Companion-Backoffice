import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthSession } from '../auth/auth-session';
import { PageTitle } from './page-title';
import { Shell } from './shell';

describe('Shell', () => {
  const signOut = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([]),
        {
          provide: AuthSession,
          useValue: {
            admin: signal({ name: 'Ada Mary Placeholder', email: 'ada@test.invalid' }),
            signOut,
          },
        },
        { provide: PageTitle, useValue: { current: signal('Dioceses') } },
      ],
    });
  });

  it('shows the admin, their initials and the page title', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ada Mary Placeholder');
    expect(text).toContain('ada@test.invalid');
    expect((fixture.nativeElement as HTMLElement).querySelector('.avatar')?.textContent).toBe('AM');
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toBe(
      'Dioceses',
    );
  });

  it('signs out and returns to the sign-in page', async () => {
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.sign-out')?.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(signOut).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('still leaves the shell when the logout call fails', async () => {
    signOut.mockRejectedValueOnce(new Error('offline'));
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    await fixture.componentInstance['signOut']().catch(() => undefined);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});

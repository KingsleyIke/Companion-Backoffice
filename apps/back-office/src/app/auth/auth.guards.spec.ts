import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  UrlTree,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';

import { redirectSignedIn, requireSignIn } from './auth.guards';
import { AuthSession } from './auth-session';

describe('auth guards', () => {
  let signedIn: boolean;

  beforeEach(() => {
    signedIn = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthSession, useValue: { isSignedIn: () => signedIn } },
      ],
    });
  });

  const run = (guard: typeof requireSignIn, url = '/dioceses') =>
    TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  const serialize = (result: unknown) =>
    result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : result;

  it('sends a signed-out admin to sign in, remembering where they were going', () => {
    expect(serialize(run(requireSignIn))).toBe('/login?returnUrl=%2Fdioceses');
    signedIn = true;
    expect(run(requireSignIn)).toBe(true);
  });

  it('skips the sign-in page for a signed-in admin', () => {
    expect(run(redirectSignedIn)).toBe(true);
    signedIn = true;
    expect(serialize(run(redirectSignedIn))).toBe('/');
  });
});

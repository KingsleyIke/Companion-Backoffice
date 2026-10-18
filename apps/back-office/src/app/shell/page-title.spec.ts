import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';

import { PageTitle } from './page-title';

@Component({ template: '' })
class Blank {}

describe('PageTitle', () => {
  it('names the tab and the header after the route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dioceses', title: 'Dioceses', component: Blank },
          { path: 'untitled', component: Blank },
        ]),
        { provide: TitleStrategy, useExisting: PageTitle },
      ],
    });
    const router = TestBed.inject(Router);
    const pageTitle = TestBed.inject(PageTitle);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/dioceses');
    expect(pageTitle.current()).toBe('Dioceses');
    expect(title.getTitle()).toBe('Dioceses · Companion Back Office');

    await router.navigateByUrl('/untitled');
    expect(pageTitle.current()).toBe('');
    expect(title.getTitle()).toBe('Companion Back Office');
  });
});

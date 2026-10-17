import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DioceseDto, DiocesePageDto } from '@companion/contracts';

import { DiocesesPage } from './dioceses-page';

describe('DiocesesPage', () => {
  let fixture: ComponentFixture<DiocesesPage>;
  let http: HttpTestingController;

  const diocese = (name: string): DioceseDto => ({
    id: `id-${name}`,
    name,
    slug: name.toLowerCase(),
    type: 'diocese',
    provinceId: null,
    seatCity: 'City',
    state: 'State',
    publicationStatus: 'published',
  });

  // The page awaits the response in a promise chain that whenStable() does not track.
  const settle = async () => {
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  };

  const respond = async (page: DiocesePageDto) => {
    http.expectOne((req) => req.url === '/api/v1/dioceses').flush(page);
    await settle();
  };

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const button = (label: string) =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === label,
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DiocesesPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DiocesesPage);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('lists dioceses from the generated client', async () => {
    expect(text()).toContain('Loading dioceses');
    await respond({ items: [diocese('Alpha'), diocese('Bravo')], nextCursor: null });
    expect(text()).toContain('Alpha');
    expect(text()).toContain('Bravo');
    expect(button('Load more')).toBeUndefined();
  });

  it('says so when no diocese is published yet', async () => {
    await respond({ items: [], nextCursor: null });
    expect(text()).toContain('No published dioceses yet.');
  });

  it('appends the next page using the cursor', async () => {
    await respond({ items: [diocese('Alpha')], nextCursor: 'cursor-1' });
    button('Load more')?.click();
    const next = http.expectOne((req) => req.url === '/api/v1/dioceses');
    expect(next.request.params.get('cursor')).toBe('cursor-1');
    next.flush({ items: [diocese('Bravo')], nextCursor: null });
    await settle();
    expect(text()).toContain('Alpha');
    expect(text()).toContain('Bravo');
  });

  it('shows an error and retries', async () => {
    http
      .expectOne((req) => req.url === '/api/v1/dioceses')
      .flush('down', { status: 503, statusText: 'Service Unavailable' });
    await settle();
    expect(text()).toContain('Could not load dioceses.');

    button('Try again')?.click();
    await respond({ items: [diocese('Alpha')], nextCursor: null });
    expect(text()).toContain('Alpha');
  });
});

import { Component, inject, signal } from '@angular/core';
import { Api, DioceseDto, listDioceses } from '@companion/contracts';

@Component({
  selector: 'app-dioceses-page',
  templateUrl: './dioceses-page.html',
  styleUrl: './dioceses-page.scss',
})
export class DiocesesPage {
  private readonly api = inject(Api);

  protected readonly dioceses = signal<DioceseDto[]>([]);
  protected readonly nextCursor = signal<string | null>(null);
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  constructor() {
    void this.loadMore();
  }

  // Loads the first page, or the page after the last one shown; also retries a failed load.
  protected async loadMore(): Promise<void> {
    this.status.set('loading');
    try {
      const page = await this.api.invoke(listDioceses, { cursor: this.nextCursor() ?? undefined });
      this.dioceses.update((shown) => [...shown, ...page.items]);
      this.nextCursor.set(page.nextCursor);
      this.status.set('ready');
    } catch {
      this.status.set('error');
    }
  }
}

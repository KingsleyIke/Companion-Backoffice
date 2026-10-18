import { inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';

// Each route's `title` becomes both the browser tab title and the shell's header.
@Injectable({ providedIn: 'root' })
export class PageTitle extends TitleStrategy {
  private readonly title = inject(Title);
  readonly current = signal('');

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot) ?? '';
    this.current.set(page);
    this.title.setTitle(page ? `${page} · Companion Back Office` : 'Companion Back Office');
  }
}

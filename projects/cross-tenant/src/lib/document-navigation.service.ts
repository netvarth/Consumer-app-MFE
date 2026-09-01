import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DocumentNavigationService {
  assign(url: string): void {
    window.location.assign(url);
  }
}

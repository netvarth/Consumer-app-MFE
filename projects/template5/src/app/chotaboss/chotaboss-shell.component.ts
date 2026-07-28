import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { chotaBossAssetUrl } from './chotaboss-assets';

@Component({
  selector: 'cb-shell',
  template: '<router-outlet />'
})
export class ChotaBossShellComponent implements OnInit, OnDestroy {
  private stylesheet?: HTMLLinkElement;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    const existing = this.document.head.querySelector<HTMLLinkElement>('link[data-chotaboss-theme]');
    if (existing) {
      return;
    }

    const stylesheet = this.document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chotaBossAssetUrl('chotaboss.css');
    stylesheet.dataset['chotabossTheme'] = 'true';
    this.document.head.appendChild(stylesheet);
    this.stylesheet = stylesheet;
  }

  ngOnDestroy(): void {
    this.stylesheet?.remove();
  }
}

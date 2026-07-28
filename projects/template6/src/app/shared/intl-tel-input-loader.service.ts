import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EnvironmentService, SharedService } from 'jconsumer-shared';

@Injectable({ providedIn: 'root' })
export class IntlTelInputLoaderService {
  private readySubject = new BehaviorSubject<boolean>(false);
  readonly ready$ = this.readySubject.asObservable();
  private loading = false;

  constructor(
    private sharedService: SharedService,
    private environmentService: EnvironmentService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.load();
  }

  private ensureTrailingSlash(path: string): string {
    if (!path) {
      return '';
    }
    return path.endsWith('/') ? path : `${path}/`;
  }

  private load(): void {
    if (this.readySubject.value || this.loading) {
      return;
    }
    this.loading = true;

    const cdnBase = this.ensureTrailingSlash(this.sharedService.getCDNPath() || 'https://jaldeeassets-test.s3.ap-south-1.amazonaws.com/');
    const intlPath = this.ensureTrailingSlash(this.environmentService.getEnvironment('INTL_TEL_INPUT_PATH') || 'global/intl-tel-input/');
    const basePath = intlPath.startsWith('http') ? intlPath : `${cdnBase}${intlPath}`;
    const cssUrl = `${basePath}css/intlTelInput.min.css`;
    const jsUrl = `${basePath}js/intlTelInput.min.js`;

    const cssId = 'intl-tel-input-css';
    const jsId = 'intl-tel-input-js';

    const markReady = () => {
      if (!this.readySubject.value) {
        this.readySubject.next(true);
      }
    };

    const existingCss = this.document.getElementById(cssId) as HTMLLinkElement | null;
    if (existingCss) {
      if (existingCss.sheet) {
        markReady();
      } else {
        existingCss.addEventListener('load', markReady, { once: true });
        existingCss.addEventListener('error', markReady, { once: true });
      }
    } else {
      const link = this.document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = cssUrl;
      link.onload = markReady;
      link.onerror = markReady;
      this.document.head.appendChild(link);
    }

    if (!this.document.getElementById(jsId)) {
      const script = this.document.createElement('script');
      script.id = jsId;
      script.src = jsUrl;
      script.async = true;
      script.defer = true;
      this.document.body.appendChild(script);
    }
  }
}

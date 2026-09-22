import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EnvironmentService, SharedService } from 'jconsumer-shared';

@Injectable({ providedIn: 'root' })
export class IntlTelInputLoaderService {
  private readySubject = new BehaviorSubject<boolean>(false);
  readonly ready$ = this.readySubject.asObservable();
  private failedSubject = new BehaviorSubject<boolean>(false);
  readonly failed$ = this.failedSubject.asObservable();
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

  load(): void {
    if (this.readySubject.value || this.loading) {
      return;
    }
    this.loading = true;
    this.failedSubject.next(false);

    const cdnBase = this.ensureTrailingSlash(this.sharedService.getCDNPath() || 'https://jaldeeassets-test.s3.ap-south-1.amazonaws.com/');
    const intlPath = this.ensureTrailingSlash(this.environmentService.getEnvironment('INTL_TEL_INPUT_PATH') || 'global/intl-tel-input/');
    const basePath = intlPath.startsWith('http') ? intlPath : `${cdnBase}${intlPath}`;
    const cssUrl = `${basePath}css/intlTelInput.min.css`;
    // Keep CSS external so its relative flag URLs resolve against the CDN.
    // Match the formatting utility version used by the shared phone control.
    const utilsUrl = 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js';
    Promise.all([
      this.loadAsset('intl-tel-input-css', cssUrl, 'link',
        () => !!(this.document.getElementById('intl-tel-input-css') as HTMLLinkElement)?.sheet),
      this.loadAsset('intl-tel-input-utils', utilsUrl, 'script',
        () => typeof (this.document.defaultView as any)?.intlTelInputUtils?.formatNumber === 'function')
    ]).then(() => {
      this.loading = false;
      this.readySubject.next(true);
    }).catch(() => {
      this.loading = false;
      this.failedSubject.next(true);
    });
  }

  private loadAsset(id: string, url: string, tag: 'link' | 'script', isReady: () => boolean): Promise<void> {
    if (isReady()) {
      return Promise.resolve();
    }
    let element = this.document.getElementById(id) as HTMLLinkElement | HTMLScriptElement;
    if (element?.dataset['intlLoadState'] === 'error') {
      element.remove();
      element = null;
    }
    const isNew = !element;
    if (isNew) {
      element = this.document.createElement(tag);
      element.id = id;
      if (tag === 'link') {
        (element as HTMLLinkElement).rel = 'stylesheet';
        (element as HTMLLinkElement).href = url;
      } else {
        (element as HTMLScriptElement).src = url;
        (element as HTMLScriptElement).async = true;
      }
    }
    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        element.removeEventListener('load', onLoad);
        element.removeEventListener('error', onError);
      };
      const onError = () => {
        cleanup();
        element.dataset['intlLoadState'] = 'error';
        reject(new Error('Unable to load phone input asset'));
      };
      const onLoad = () => {
        if (!isReady()) {
          onError();
          return;
        }
        cleanup();
        element.dataset['intlLoadState'] = 'loaded';
        resolve();
      };
      element.addEventListener('load', onLoad, { once: true });
      element.addEventListener('error', onError, { once: true });
      if (isNew) {
        this.document.head.appendChild(element);
      }
    });
  }
}

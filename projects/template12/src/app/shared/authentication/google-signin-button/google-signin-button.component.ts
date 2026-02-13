import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';

declare const google: any;

@Component({
  selector: 'app-google-signin-button',
  templateUrl: './google-signin-button.component.html',
  styleUrls: ['./google-signin-button.component.css']
})
export class GoogleSigninButtonComponent implements AfterViewInit, OnDestroy {
  @Input() clientId: string;
  @Input() disabled = false;
  @Input() text = 'Sign in with Google';
  @Output() tokenReceived = new EventEmitter<string>();
  @Output() error = new EventEmitter<any>();
  @ViewChild('customBtn', { static: true }) customBtn: ElementRef<HTMLButtonElement>;
  @ViewChild('gisButton', { static: true }) gisButton: ElementRef<HTMLDivElement>;

  private static gisPromise: Promise<void> | null = null;
  private resizeObserver?: ResizeObserver;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    if (!this.clientId) {
      this.error.emit('Google client id missing');
      return;
    }
    this.loadGis()
      .then(() => this.renderButton())
      .catch((err) => this.error.emit(err));
    this.observeResize();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  private loadGis(): Promise<void> {
    if (GoogleSigninButtonComponent.gisPromise) {
      return GoogleSigninButtonComponent.gisPromise;
    }
    GoogleSigninButtonComponent.gisPromise = new Promise((resolve, reject) => {
      if (window['google']?.accounts?.id) {
        resolve();
        return;
      }
      const script = this.renderer.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject('Failed to load Google Identity Services');
      this.renderer.appendChild(document.body, script);
    });
    return GoogleSigninButtonComponent.gisPromise;
  }

  private renderButton(): void {
    if (!this.gisButton?.nativeElement || !window['google']?.accounts?.id) {
      return;
    }
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => {
        const token = response?.credential;
        if (token) {
          this.tokenReceived.emit(token);
        } else {
          this.error.emit('Google token missing');
        }
      }
    });
    const width = this.getButtonWidth();
    this.gisButton.nativeElement.innerHTML = '';
    google.accounts.id.renderButton(this.gisButton.nativeElement, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      logo_alignment: 'center',
      text: 'signin_with',
      width
    });
  }

  private observeResize(): void {
    if (!this.customBtn?.nativeElement || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => {
      this.renderButton();
    });
    this.resizeObserver.observe(this.customBtn.nativeElement);
  }

  private getButtonWidth(): number {
    const target = this.customBtn?.nativeElement;
    const width = target?.getBoundingClientRect().width || 240;
    return Math.round(Math.min(Math.max(width, 120), 400));
  }
}

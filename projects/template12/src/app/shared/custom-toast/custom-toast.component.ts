import { Component, ViewEncapsulation } from '@angular/core';
import { Message } from 'primeng/api';

type ToastTone = 'default' | 'info' | 'success' | 'error' | 'warning';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomToastComponent {
  getTone(message: Message | null | undefined): ToastTone {
    const severity = (message?.severity || '').toLowerCase();
    if (severity === 'success') {
      return 'success';
    }
    if (severity === 'info') {
      return 'info';
    }
    if (severity === 'warn' || severity === 'warning') {
      return 'warning';
    }
    if (severity === 'error' || severity === 'danger') {
      return 'error';
    }
    return 'default';
  }

  getTitle(message: Message | null | undefined): string {
    if (message?.summary && String(message.summary).trim().length > 0) {
      return String(message.summary);
    }
    const tone = this.getTone(message);
    if (tone === 'success') {
      return 'Success';
    }
    if (tone === 'info') {
      return 'Information';
    }
    if (tone === 'warning') {
      return 'Warning';
    }
    if (tone === 'error') {
      return 'Error';
    }
    return 'Notice';
  }

  getBody(message: Message | null | undefined): string {
    const detail = message?.detail ? String(message.detail) : '';
    const summary = message?.summary ? String(message.summary) : '';
    if (detail && summary && detail.trim() === summary.trim()) {
      return detail;
    }
    return detail || summary || '';
  }

  getIcon(message: Message | null | undefined): string {
    const tone = this.getTone(message);
    if (tone === 'success') {
      return '✓';
    }
    if (tone === 'error') {
      return '!';
    }
    if (tone === 'info' || tone === 'warning' || tone === 'default') {
      return 'i';
    }
    return 'i';
  }

  getActionLabel(message: Message | null | undefined): string {
    const actionLabel = message?.data?.actionLabel;
    if (typeof actionLabel === 'string' && actionLabel.trim().length > 0) {
      return actionLabel.toUpperCase();
    }
    return 'BUTTON';
  }

  onAction(message: Message | null | undefined, closeFn: (() => void) | undefined): void {
    const action = message?.data?.action;
    if (typeof action === 'function') {
      action();
    }
    if (closeFn) {
      closeFn();
    }
  }

  onDismiss(closeFn: (() => void) | undefined): void {
    if (closeFn) {
      closeFn();
    }
  }
}

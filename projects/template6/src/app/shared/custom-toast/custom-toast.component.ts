import { Component, ViewEncapsulation } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

type ToastTone = 'default' | 'info' | 'success' | 'error' | 'warning';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomToastComponent {
  private readonly toastKey = 'template12Toast';

  constructor(private messageService: MessageService) {}

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
    return 'i';
  }

  hasAction(message: Message | null | undefined): boolean {
    const actionLabel = message?.data?.actionLabel;
    return typeof actionLabel === 'string' && actionLabel.trim().length > 0;
  }

  getActionLabel(message: Message | null | undefined): string {
    const actionLabel = message?.data?.actionLabel;
    if (typeof actionLabel === 'string' && actionLabel.trim().length > 0) {
      return actionLabel.toUpperCase();
    }
    return '';
  }

  onAction(message: Message | null | undefined): void {
    const action = message?.data?.action;
    if (typeof action === 'function') {
      action();
    }
    this.messageService.clear(this.toastKey);
  }

  onDismiss(): void {
    this.messageService.clear(this.toastKey);
  }
}

import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable()
export class Template12ToastService {
  private readonly toastKey = 'template12Toast';
  private readonly toastLife = 2500;

  constructor(private messageService: MessageService) {}

  showToast(type: any, heading: any, content: any): void {
    this.messageService.add({
      key: this.toastKey,
      life: this.toastLife,
      sticky: false,
      severity: this.normalizeSeverity(type),
      summary: this.normalizeText(heading),
      detail: this.normalizeText(content)
    });
  }

  showSuccess(message: any): void {
    this.messageService.add({
      key: this.toastKey,
      life: this.toastLife,
      sticky: false,
      severity: 'success',
      detail: this.normalizeText(message)
    });
  }

  showInfo(message: any): void {
    this.messageService.add({
      key: this.toastKey,
      life: this.toastLife,
      sticky: false,
      severity: 'info',
      detail: this.normalizeText(message)
    });
  }

  showWarn(message: any): void {
    this.messageService.add({
      key: this.toastKey,
      life: this.toastLife,
      sticky: false,
      severity: 'warn',
      detail: this.normalizeText(message)
    });
  }

  showError(message: any): void {
    this.messageService.add({
      key: this.toastKey,
      life: this.toastLife,
      sticky: false,
      severity: 'error',
      detail: this.normalizeText(message)
    });
  }

  private normalizeSeverity(type: any): 'success' | 'info' | 'warn' | 'error' {
    const value = String(type || '').toLowerCase();
    if (value === 'success') {
      return 'success';
    }
    if (value === 'info') {
      return 'info';
    }
    if (value === 'warn' || value === 'warning') {
      return 'warn';
    }
    return 'error';
  }

  private normalizeText(value: any): string {
    if (value === undefined || value === null) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((entry) => this.normalizeText(entry)).filter(Boolean).join(', ');
    }

    const knownPaths = [
      value?.message,
      value?.error,
      value?.error?.message,
      value?.error?.error,
      value?.description,
      value?.detail
    ];
    const resolved = knownPaths.find((entry) => typeof entry === 'string' && entry.trim().length > 0);
    if (resolved) {
      return resolved;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
}

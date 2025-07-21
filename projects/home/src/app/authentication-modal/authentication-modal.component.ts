import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationModule } from '../authentication/authentication.module';
import { SubscriptionService, ToastService } from 'jconsumer-shared';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-authentication-modal',
  standalone: true,
  imports: [CommonModule, AuthenticationModule],
  providers: [
    MessageService,
    ToastService
  ],
  templateUrl: './authentication-modal.component.html',
  styleUrl: './authentication-modal.component.scss'
})
export class AuthenticationModalComponent {
  constructor(
    public dialogRef: MatDialogRef<AuthenticationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  actionPerformed(event) {
    this.dialogRef.close(event);
  }

  closeModal() {
    this.dialogRef.close();
  }
}

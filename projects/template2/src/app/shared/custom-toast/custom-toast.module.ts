import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { CustomToastComponent } from './custom-toast.component';

@NgModule({
  declarations: [CustomToastComponent],
  imports: [CommonModule, ToastModule],
  exports: [CustomToastComponent]
})
export class CustomToastModule {}


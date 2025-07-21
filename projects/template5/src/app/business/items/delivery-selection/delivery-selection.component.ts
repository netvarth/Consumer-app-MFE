import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';


@Component({
  selector: 'app-delivery-selection',
  templateUrl: './delivery-selection.component.html',
  styleUrl: './delivery-selection.component.scss'
})
export class DeliverySelectionComponent {
selectedService: string = 'HOME_DELIVERY';
  theme: any;

constructor(
     @Inject(MAT_DIALOG_DATA) public data: any,
       private config: DynamicDialogConfig,
      private dialogRef: DynamicDialogRef,
    ) {}
  ngOnInit(): void {
    if (this.config.data) {
      this.theme = this.config.data.theme;
      console.log(this.config.data,'this.options')
    }
  }
 onServiceSelect() {
  console.log('Selected service:', this.selectedService);
  this.dialogRef.close(this.selectedService); // Pass the value and close dialog
}

}

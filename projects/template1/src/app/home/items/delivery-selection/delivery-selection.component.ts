import { Component } from '@angular/core';
import { SharedService } from 'jconsumer-shared';
import { DynamicDialogRef } from 'primeng/dynamicdialog';


@Component({
  selector: 'app-delivery-selection',
  templateUrl: './delivery-selection.component.html',
  styleUrl: './delivery-selection.component.scss'
})
export class DeliverySelectionComponent {
  selectedService: string = 'HOME_DELIVERY';
  cdnPath: string = '';
  config: any;
  theme: any;
  constructor(
    private dialogRef: DynamicDialogRef,
    private sharedService: SharedService,
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
  }
  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
  }
  onServiceSelect() {
    this.dialogRef.close(this.selectedService); // Pass the value and close dialog
  }

}

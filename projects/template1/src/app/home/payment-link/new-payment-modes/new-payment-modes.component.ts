import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-new-payment-modes',
  templateUrl: './new-payment-modes.component.html',
  styleUrls: ['./new-payment-modes.component.scss']
})
export class NewPaymentModesComponent implements OnInit {
  @Input() selectedMode;
  @Input() cashPay;
  @Input() paymentModes;
  @Output() modeSelected = new EventEmitter<any>();
  paymentMode: any;

  constructor(private sharedService: SharedService) { }

  ngOnInit(): void {
    if(this.selectedMode && this.selectedMode != '') {
      let paymentModeObj = this.paymentModes.filter(payment => payment.mode === this.selectedMode)[0];
      this.paymentMode = paymentModeObj.mode;
      paymentModeObj['value'] = this.paymentMode;
      this.modeSelected.emit(paymentModeObj);
    }
  }
  getImageSrc(mode) {
    let cdnPath = this.sharedService.getCDNPath();
    return (cdnPath + 'assets/images/payment-modes-new/' + mode + '.png');
  }

  paymentModeSelected(event) {
    this.modeSelected.emit(event);
  }
}

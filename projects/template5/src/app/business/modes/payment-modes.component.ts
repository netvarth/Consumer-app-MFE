import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-payment-modes',
  templateUrl: './payment-modes.component.html',
  styleUrls: ['./payment-modes.component.css']
})
export class PaymentModesComponent implements OnInit {

  @Input() selectedMode;
  @Input() cashPay;
  @Input() paymentModes;
  @Output() modeSelected = new EventEmitter<any>();
  paymentMode: any;

  constructor() { }

  ngOnInit(): void {
    let paymentModeObj = this.paymentModes.filter(payment => payment.mode === this.selectedMode)[0];
    this.paymentMode = paymentModeObj.mode;
    paymentModeObj['value'] = this.paymentMode;
    this.modeSelected.emit(paymentModeObj);
  }

  getImageSrc(mode) {
    return 'assets/images/payment-modes/' + mode + '.png';
  }

  paymentModeSelected(event) {
    this.modeSelected.emit(event);
  }

}

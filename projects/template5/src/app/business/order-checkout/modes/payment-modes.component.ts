import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-payment-modes',
  templateUrl: './payment-modes.component.html',
  styleUrls: ['./payment-modes.component.css']
})
export class PaymentModesComponent implements OnInit {

  @Input() cashPay;
  @Input() paymentModes;
  @Output() modeSelected = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  getImageSrc(mode) {
    return 'assets/images/myjaldee/payment-modes/' + mode + '.png';
  }
  paymentModeSelected(event) {
    this.modeSelected.emit(event);
  }

}

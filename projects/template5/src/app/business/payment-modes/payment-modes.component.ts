import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-payment-modes',
  templateUrl: './payment-modes.component.html',
  styleUrls: ['./payment-modes.component.css']
})
export class PaymentModesComponent implements OnInit {

  @Input() cashPay;
  @Input() paymentModes;
  @Input() selectedMode;
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
    // console.log('mode',mode);
    if(mode && mode==='UPI'){
      return 'assets/images/myjaldee/upiPayment.png';
    }
    else if(mode && mode==='CC'){
      return 'assets/images/myjaldee/creditcard.png';
    }
    else if(mode && mode==='DC'){
      return 'assets/images/myjaldee/debitCard.png';
    }
    else if(mode && mode==='NB'){
      return 'assets/images/myjaldee/netBanking.png';
    }
    else if(mode && mode==='WALLET'){
      return 'assets/images/myjaldee/wallet.png';
    }
    else if(mode && mode==='PAYLATER'){
      return 'assets/images/myjaldee/payLater.png';
    }
    else{
      return 'assets/images/payment-modes/' + mode + '.png';
    }
    
  }

  paymentModeSelected(event) {
    this.modeSelected.emit(event);
  }

}

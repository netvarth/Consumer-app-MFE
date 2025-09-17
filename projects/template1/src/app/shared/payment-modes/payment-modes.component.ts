import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

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
  cdnPath: string = '';
  constructor(private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    let paymentModeObj = this.paymentModes.filter(payment => payment.mode === this.selectedMode)[0];
    this.paymentMode = paymentModeObj.mode;
    paymentModeObj['value'] = this.paymentMode;
    this.modeSelected.emit(paymentModeObj);
  }

  getImageSrc(mode) {
    let cdnPath = this.sharedService.getCDNPath();
    if(mode && mode==='UPI'){
      return (cdnPath + 'assets/images/myjaldee/upiPayment.png');
    }
    else if(mode && mode==='CC'){
      return (cdnPath + 'assets/images/myjaldee/creditcard.png');
    }
    else if(mode && mode==='DC'){
      return (cdnPath + 'assets/images/myjaldee/debitCard.png');
    }
    else if(mode && mode==='NB'){
      return (cdnPath + 'assets/images/myjaldee/netBanking.png');
    }
    else if(mode && mode==='WALLET'){
      return (cdnPath + 'assets/images/myjaldee/wallet.png');
    }
    else if(mode && mode==='PAYLATER'){
      return (cdnPath + 'assets/images/myjaldee/payLater.png');
    }
    else{
      return (cdnPath + 'assets/images/payment-modes/' + mode + '.png');
    }
    
  }

  paymentModeSelected(event) {
    this.modeSelected.emit(event);
  }

}

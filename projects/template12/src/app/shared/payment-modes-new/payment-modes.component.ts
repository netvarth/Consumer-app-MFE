import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-payment-modes-new',
  templateUrl: './payment-modes.component.html',
  styleUrls: ['./payment-modes.component.css']
})
export class PaymentModesComponent implements OnInit, OnChanges {

  @Input() cashPay;
  @Input() paymentModes;
  @Input() selectedMode;
  @Output() modeSelected = new EventEmitter<any>();
  paymentMode: any;
  cdnPath: string = '';
  constructor(private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    if (this.paymentModes && this.paymentModes.length > 0) {
      // Use selectedMode if provided, otherwise default to first mode
      const paymentModeObj = this.selectedMode 
        ? this.paymentModes.find(payment => payment.mode === this.selectedMode) || this.paymentModes[0]
        : this.paymentModes[0];
      this.paymentMode = paymentModeObj.mode;
      // Emit initial selection
      const emitObj = { value: this.paymentMode, ...paymentModeObj };
      this.modeSelected.emit(emitObj);
    }
  }

  ngOnChanges(): void {
    // Update paymentMode when selectedMode input changes from parent
    if (this.selectedMode && this.paymentModes) {
      const found = this.paymentModes.find(payment => payment.mode === this.selectedMode);
      if (found) {
        this.paymentMode = this.selectedMode;
      }
    }
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
    // Extract the selected value from mat-radio-group change event
    const selectedValue = event?.value || event?.target?.value;
    
    if (selectedValue) {
      // Update internal paymentMode to reflect the selection in UI
      this.paymentMode = selectedValue;
      
      // Find the corresponding payment mode object
      const selectedModeObj = this.paymentModes?.find(mode => mode.mode === selectedValue);
      
      // Emit with value property for parent component compatibility
      const emitObj = selectedModeObj 
        ? { value: selectedValue, ...selectedModeObj }
        : { value: selectedValue };
      
      this.modeSelected.emit(emitObj);
    }
  }

  getModeTitle(mode: any): string {
    const name = (mode?.modeDisplayName || mode?.mode || '').toString().toLowerCase();
    if (name.includes('cash') || name === 'cod') {
      return 'Cash on Delivery';
    }
    if (name.includes('upi')) {
      return 'UPI / QR Code';
    }
    if (name.includes('credit') || name === 'cc') {
      return 'Credit Card';
    }
    if (name.includes('debit') || name === 'dc') {
      return 'Debit Card';
    }
    return mode?.modeDisplayName || mode?.mode || 'Payment Method';
  }

  getModeSubtitle(mode: any): string {
    const name = (mode?.modeDisplayName || mode?.mode || '').toString().toLowerCase();
    if (name.includes('cash') || name === 'cod') {
      return 'Pay when you receive';
    }
    if (name.includes('upi')) {
      return 'GPay, PhonePe, Paytm';
    }
    if (name.includes('credit') || name.includes('debit') || name === 'cc' || name === 'dc') {
      return 'Visa, Mastercard, RuPay';
    }
    return '';
  }

}

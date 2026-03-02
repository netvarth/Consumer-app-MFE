import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-payment-modes',
  templateUrl: './payment-modes.component.html',
  styleUrls: ['./payment-modes.component.css']
})
export class PaymentModesComponent implements OnInit, OnChanges {

  @Input() cashPay;
  @Input() paymentModes;
  @Input() indianPaymentModes;
  @Input() nonIndianPaymentModes;
  @Input() selectedMode;
  @Input() mobileSheet: boolean = false;
  @Input() showPaymentToggle: boolean = false;
  @Input() paymentToggleChecked: boolean = false;
  @Input() paymentToggleLabel: string = 'Non Indian Payment';
  @Output() paymentToggleChange = new EventEmitter<boolean>();
  @Output() modeSelected = new EventEmitter<any>();
  paymentMode: any;
  pendingMode: any;
  selectedModeObj: any;
  pendingModeObj: any;
  displayPaymentModes: any[] = [];
  internalToggle: boolean = false;
  cdnPath: string = '';
  isSheetOpen = false;
  constructor(private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.syncSelectedMode(true);
  }

  ngOnChanges(): void {
    this.syncSelectedMode(false);
  }

  private syncSelectedMode(emit: boolean): void {
    if (this.paymentModes && this.paymentModes.length > 0) {
      const paymentModeObj =
        this.selectedMode
          ? this.paymentModes.find(payment => payment.mode === this.selectedMode) || this.paymentModes[0]
          : this.paymentModes[0];
      this.paymentMode = paymentModeObj.mode;
      this.selectedModeObj = paymentModeObj;
      this.internalToggle = !!this.paymentToggleChecked;
      this.refreshDisplayModes();
      if (emit) {
        const emitObj = { value: this.paymentMode, ...paymentModeObj };
        this.modeSelected.emit(emitObj);
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
    const selectedValue = event?.value || event?.target?.value;
    if (!selectedValue) {
      return;
    }
    if (this.mobileSheet) {
      this.pendingMode = selectedValue;
      this.pendingModeObj = this.displayPaymentModes?.find(mode => mode.mode === selectedValue) || null;
      return;
    }
    this.paymentMode = selectedValue;
    const selectedModeObj = this.displayPaymentModes?.find(mode => mode.mode === selectedValue)
      || this.paymentModes?.find(mode => mode.mode === selectedValue);
    this.selectedModeObj = selectedModeObj || null;
    const emitObj = selectedModeObj ? { value: selectedValue, ...selectedModeObj } : { value: selectedValue };
    this.modeSelected.emit(emitObj);
  }

  getModeTitle(mode: any): string {
    const name = (mode?.modeDisplayName || mode?.mode || '').toString().toLowerCase();
    if (name.includes('cash') || name === 'cod') {
      return 'Cash on Delivery';
    }
    if (name.includes('upi')) {
      return 'UPI';
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

  getSelectedTitle(): string {
    const usePending = this.mobileSheet && this.isSheetOpen;
    const mode = (usePending ? this.pendingModeObj : this.selectedModeObj)
      || this.paymentModes?.find(m => m.mode === (usePending ? this.pendingMode : this.paymentMode));
    return this.getModeTitle(mode);
  }

  getSelectedSubtitle(): string {
    const usePending = this.mobileSheet && this.isSheetOpen;
    const mode = (usePending ? this.pendingModeObj : this.selectedModeObj)
      || this.paymentModes?.find(m => m.mode === (usePending ? this.pendingMode : this.paymentMode));
    return this.getModeSubtitle(mode);
  }

  getSelectedIcon(): string {
    const usePending = this.mobileSheet && this.isSheetOpen;
    const mode = (usePending ? this.pendingModeObj : this.selectedModeObj)
      || this.paymentModes?.find(m => m.mode === (usePending ? this.pendingMode : this.paymentMode));
    return this.getImageSrc(mode?.mode);
  }

  openSheet(): void {
    this.pendingMode = this.paymentMode;
    this.pendingModeObj = this.selectedModeObj;
    this.internalToggle = !!this.paymentToggleChecked;
    this.refreshDisplayModes();
    this.isSheetOpen = true;
  }

  closeSheet(): void {
    if (this.mobileSheet) {
      this.pendingMode = this.paymentMode;
      this.pendingModeObj = this.selectedModeObj;
      this.internalToggle = !!this.paymentToggleChecked;
      this.refreshDisplayModes();
    }
    this.isSheetOpen = false;
  }

  onPaymentToggleChange(event: Event): void {
    const target = event?.target as HTMLInputElement;
    this.internalToggle = !!target?.checked;
    this.refreshDisplayModes();
  }

  saveSelection(): void {
    if (!this.pendingMode) {
      this.closeSheet();
      return;
    }
    this.paymentMode = this.pendingMode;
    this.selectedModeObj = this.pendingModeObj;
    const emitObj = this.selectedModeObj
      ? { value: this.paymentMode, ...this.selectedModeObj }
      : { value: this.paymentMode };
    this.modeSelected.emit(emitObj);
    if (this.showPaymentToggle) {
      this.paymentToggleChange.emit(this.internalToggle);
    }
    this.closeSheet();
  }

  private refreshDisplayModes(): void {
    if (this.showPaymentToggle && this.mobileSheet && (this.indianPaymentModes || this.nonIndianPaymentModes)) {
      this.displayPaymentModes = this.internalToggle
        ? (this.nonIndianPaymentModes || [])
        : (this.indianPaymentModes || []);
    } else {
      this.displayPaymentModes = this.paymentModes || [];
    }

    if (!this.mobileSheet) {
      return;
    }

    const current = this.displayPaymentModes?.find(mode => mode.mode === this.pendingMode);
    if (current) {
      this.pendingModeObj = current;
      return;
    }
    const fallback = this.displayPaymentModes?.[0];
    this.pendingMode = fallback?.mode;
    this.pendingModeObj = fallback || null;
  }

}

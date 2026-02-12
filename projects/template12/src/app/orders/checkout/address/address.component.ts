import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxComponent, ConsumerService, ErrorMessagingService, FormMessageDisplayService, OrderService, projectConstantsLocal, SharedService, ToastService } from 'jconsumer-shared';
import { IntlTelInputLoaderService } from '../../../shared/intl-tel-input-loader.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {

  @Input() deliveryAddressP: any; // Parameter
  @Output() addressSelected = new EventEmitter<any>();

  deliveryAddress: any;
  preferredCountries = ['in', 'uk', 'us'];
  isEditable: any = false;
  addressForm: FormGroup;
  separateDialCode = true;

  newAddress: any;
  canceldialogRef: any;

  addedAddresses: any = [];
  clicked: any = false;
  config: any;
  theme: any;
  activeKey: number = -1;
  countryCode: any;
  phonenoHolder: any;
  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private toastService: ToastService,
    private dialog: MatDialog,
    private consumerService: ConsumerService,
    public fed_service: FormMessageDisplayService,
    private sharedService: SharedService,
    private errorService: ErrorMessagingService,
    public intlTelInputLoader: IntlTelInputLoaderService
  ) { }

  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    console.log("Delivery Address Param: ", this.deliveryAddressP);

    this.createForm();
    this.getAddresses();
  }
  isFormInvalid() {
    let invalid = false;
    if (this.addressForm.get('firstName').status !== 'VALID' || this.addressForm.get('lastName').status !== 'VALID'
      || this.addressForm.get('email').status !== 'VALID' || this.addressForm.get('address').status !== 'VALID'
      || this.addressForm.get('city').status !== 'VALID' || this.addressForm.get('postalCode').status !== 'VALID'
      || this.addressForm.get('landMark').status !== 'VALID' || this.addressForm.get('state').status !== 'VALID' || this.addressForm.get('country').status !== 'VALID') {
      invalid = true;
    } else {
      if (this.addressForm.get('phoneNumber').value) {
        let phoneObj = this.addressForm.get('phoneNumber');
        let dialCode = phoneObj.value.dialCode;
        let phoneNumber = '';
        if (phoneObj.value.e164Number) {
          phoneNumber = phoneObj.value.e164Number.split(dialCode)[1];
        }
        if (phoneObj.status == 'VALID') {
        } else if (phoneNumber && phoneNumber.startsWith('55')) {
        } else {
          invalid = true;
        }
      }
      // if (this.addressForm.get('phoneNumber').value && this.addressForm.get('phoneNumber').value.e164Number) {
      //   let phoneObj = this.addressForm.get('phoneNumber');
      //   let dialCode = phoneObj.value.dialCode;
      //   let phoneNumber = phoneObj.value.e164Number.split(dialCode)[1];
      //   if (phoneObj.status == 'VALID') {
      //     invalid = false;
      //   } else if (phoneNumber && phoneNumber.startsWith('55')) {
      //     invalid = false;
      //   } else {
      //     invalid = true;
      //   }
      // } else {
      //   invalid = true;
      // }
    }
    return invalid;
  }
  addAddress() {
    this.isEditable = true;
  }
  proceedToCheckout() {
    this.addressSelected.emit(this.deliveryAddress);
  }
  viewAddress() {
    this.clicked = true;
  }

  createForm() {
    this.addressForm = this.formBuilder.group(
      {
        phoneNumber: ['', Validators.compose([Validators.required])],
        firstName: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
        lastName: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
        email: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_EMAIL)])],
        address: ['', Validators.compose([Validators.required])],
        city: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
        postalCode: ['', Validators.compose([Validators.required, Validators.maxLength(6), Validators.minLength(6), Validators.pattern(projectConstantsLocal.VALIDATOR_ONLYNUMBER)])],
        landMark: ['', Validators.compose([Validators.required])],
        state: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
        country: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])]
      }
    )
  }
  resetAddress() {
    this.isEditable = false;
    this.addressForm.get('firstName').setValue('');
    this.addressForm.get('lastName').setValue('');
    this.addressForm.get('email').setValue('');
    this.addressForm.get('address').setValue('');
    this.addressForm.get('city').setValue('');
    this.addressForm.get('postalCode').setValue('');
    this.addressForm.get('landMark').setValue('');
    this.addressForm.get('phoneNumber').setValue('');
    this.addressForm.get('state').setValue('');
    this.addressForm.get('country').setValue('');
  }
  saveAddress() {
    this.newAddress = {
      'firstName': this.addressForm.get('firstName').value,
      'lastName': this.addressForm.get('lastName').value,
      'email': this.addressForm.get('email').value,
      'city': this.addressForm.get('city').value,
      'postalCode': this.addressForm.get('postalCode').value,
      'landMark': this.addressForm.get('landMark').value,
      'address': this.addressForm.get('address').value,
      'state': this.addressForm.get('state').value,
      'country': this.addressForm.get('country').value,
    };
    let phoneNumber = this.addressForm.get('phoneNumber').value;
    this.newAddress['countryCode'] = phoneNumber.dialCode;
    this.newAddress['phoneNumber'] = phoneNumber.e164Number.split(phoneNumber.dialCode)[1];

    let currentAddresses = [...this.addedAddresses];
    if (this.activeKey != -1) {
      let currentAddress = currentAddresses.filter(address => address.key === this.activeKey)[0];
      currentAddresses.splice(currentAddress, 1);
    }

    currentAddresses.push(this.newAddress);
    console.log("Current Addresses:", currentAddresses);

    this.updateAddress(currentAddresses).then((data) => {
      if (data) {
        if (this.activeKey != -1) {
          this.newAddress['key'] = this.activeKey;
          this.activeKey = -1;
        }
        this.deliveryAddress = this.newAddress;
        this.addressSelected.emit(this.deliveryAddress);
        this.resetAddress();
        this.getAddresses();
      }
    });
  }
  editAddress(addressData, index, type?) {
    console.log("addressData",addressData)

    this.isEditable = true;
    this.addressForm.get('firstName').setValue(addressData.firstName);
    this.addressForm.get('lastName').setValue(addressData.lastName);
    this.addressForm.get('email').setValue(addressData.email);
    this.addressForm.get('address').setValue(addressData.address);
    this.addressForm.get('city').setValue(addressData.city);
    this.addressForm.get('postalCode').setValue(addressData.postalCode);
    this.addressForm.get('landMark').setValue(addressData.landMark);
    this.addressForm.get('state').setValue(addressData.state);
    this.addressForm.get('country').setValue(addressData.country);
    this.phonenoHolder = addressData['phoneNumber'] || '';
    this.countryCode = addressData['countryCode'] || '';
    if (addressData['phoneNumber'].trim() != '') {
      let phone = {
        e164Number: (this.countryCode + this.phonenoHolder)
      }
      this.addressForm.get('phoneNumber').patchValue(phone);
    }
    // if (addressData.phoneNumber) {
    //   console.log("addressData.phoneNumber",addressData.phoneNumber)
    //   this.addressForm.get('phoneNumber').setValue(addressData.phoneNumber);
    // }
    this.activeKey = addressData.key;
  }
  getAddresses() {
    this.orderService.getConsumeraddress().subscribe((data: any) => {
      if (data) {
        let address = data;
        this.addedAddresses = address.map((element, index) => {
          return { ...element, key: index };
        });
        if (this.deliveryAddressP) {
          this.deliveryAddress = this.addedAddresses.filter(address => (
            address.firstName === this.deliveryAddressP.firstName &&
            address.lastName === this.deliveryAddressP.lastName &&
            address.email === this.deliveryAddressP.email &&
            address.address === this.deliveryAddressP.address &&
            address.city === this.deliveryAddressP.city &&
            address.postalCode === this.deliveryAddressP.postalCode &&
            address.state === this.deliveryAddressP.state &&
            address.landMark === this.deliveryAddressP.landMark &&
            address.phoneNumber === this.deliveryAddressP.phoneNumber
          ))[0];
          this.deliveryAddressP = null;
        } else if (this.addedAddresses.length > 0 && !this.deliveryAddress) {
          this.deliveryAddress = this.addedAddresses[0];
        } else {
          this.addAddress();
        }
      } else {
        this.addAddress();
      }
    });
  }

  deleteAddress(address, index) {
    this.canceldialogRef = this.dialog.open(ConfirmBoxComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'confirmationmainclass'],
      disableClose: true,
      data: {
        'message': 'Do you want to Delete this address?',
        'theme': this.theme
      }
    });
    this.canceldialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addedAddresses.splice(index, 1);
        this.consumerService.updateConsumeraddress(this.addedAddresses)
          .subscribe(
            data => {
              if (data) {
                this.deliveryAddress = null;
                this.getAddresses();
              }
              this.toastService.showSuccess('Address deleted successfully');
            },
            error => {
              let errorObj = this.errorService.getApiError(error);
              this.toastService.showError(errorObj);
            }
          );
      }
    });
  }
  updateAddress(updateData) {
    return new Promise((resolve, reject) => {
      this.orderService.updateConsumeraddress(updateData).subscribe(
        data => {
          resolve(data);
        }, error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
          reject(error)
        })
    })
  }
  selectAddress(selectedAddress) {
    this.deliveryAddress = selectedAddress;
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { ConsumerService, FormMessageDisplayService, projectConstantsLocal } from 'jconsumer-shared';

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.css']
})
export class AddAddressComponent implements OnInit {
  disableSave: boolean;
  amForm: UntypedFormGroup;
  api_error = null;
  api_success = null;
  address_add: any = [];
  formMode: any;
  exist_add: any = [];
  edit_address: any;
  address_title;
  index: any;
  source: any;
  submitBtn: string;
  SearchCountryField = SearchCountryField;
  selectedCountry = CountryISO.India;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedKingdom, CountryISO.UnitedStates];
  separateDialCode = true;
  constructor(
    public dialogRef: MatDialogRef<AddAddressComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    public fed_service: FormMessageDisplayService,
    private consumerService: ConsumerService,
    private snackbarService: SnackbarService
  ) {
    this.address_title = 'Add New Address';
    this.submitBtn='Save';
    this.formMode = data.type;
    this.source = data.source;
    if (this.formMode === 'edit') {
      this.edit_address = data.update_address;
      this.address_title = 'Edit Address';
      this.submitBtn='Update';
    }
    if (data.address !== null) {
      this.exist_add = data.address;
    }

    this.edit_address = data.update_address;
    this.index = data.edit_index;

  }

  ngOnInit() {
    this.createForm();
  }
  createForm() {
    this.amForm = this.fb.group({
      phoneNumber: ['', Validators.compose([Validators.required])],
      firstName: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
      lastName: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_EMAIL)])],

      address: ['', Validators.compose([Validators.required])],
      city: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
      postalCode: ['', Validators.compose([Validators.required,Validators.maxLength(6), Validators.minLength(6), Validators.pattern(projectConstantsLocal.VALIDATOR_ONLYNUMBER)])],
      landMark: ['', Validators.compose([Validators.required])]
    });
    if (this.formMode === 'edit') {
      this.updateForm();
    }
  }
  updateForm() {
    let phoneNumber = this.edit_address.countryCode + this.edit_address.phoneNumber;
    this.amForm.setValue({
      'phoneNumber': phoneNumber || null,
      'firstName': this.edit_address.firstName || null,
      'lastName': this.edit_address.lastName || null,
      'email': this.edit_address.email || null,
      'address': this.edit_address.address || null,
      'city': this.edit_address.city || null,
      'postalCode': this.edit_address.postalCode || null,
      'landMark': this.edit_address.landMark || null
    });
    setTimeout(() => this.amForm.get('phoneNumber')?.setValue(this.edit_address.phoneNumber), 500);
  }
  close() {
    this.dialogRef.close();
  }
  onSubmit(form_data) {
    console.log(this.source);
    let postData = {
      'firstName': form_data.firstName,
      'lastName': form_data.lastName,
      'email': form_data.email,
      'city': form_data.city,
      'postalCode': form_data.postalCode,
      'landMark': form_data.landMark,
      'address': form_data.address
    };
    let phoneNumber = form_data.phoneNumber;
    postData['countryCode'] = phoneNumber.dialCode;
    postData['phoneNumber'] = phoneNumber.e164Number.split(phoneNumber.dialCode)[1];
    console.log("Form Data:", postData);
    if (this.source === 'provider') {
      console.log(postData);
      this.dialogRef.close(postData);
    }
    this.disableSave = true;
    if (this.formMode === 'edit') {
      this.exist_add.splice(this.index, 1);
    }
    this.exist_add.push(postData);
    console.log(this.exist_add);
    this.consumerService.updateConsumeraddress(this.exist_add)
      .subscribe(
        data => {
          console.log(data);
          this.disableSave = false;
          if (this.formMode === 'edit') {
            this.snackbarService.openSnackBar('Address Updated successfully', { 'panelClass': 'snackbarnormal' });
          } else {
            this.snackbarService.openSnackBar('Address Added successfully', { 'panelClass': 'snackbarnormal' });
          }
          this.dialogRef.close();
        },
        error => {
          this.disableSave = false;
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  isFormInvalid() {
    let invalid = false;
    if (this.amForm.get('firstName').status !== 'VALID' || this.amForm.get('lastName').status !== 'VALID' 
    || this.amForm.get('email').status !== 'VALID' || this.amForm.get('address').status !== 'VALID'
    || this.amForm.get('city').status !== 'VALID' || this.amForm.get('postalCode').status !== 'VALID'
    || this.amForm.get('landMark').status !== 'VALID') {
        invalid = true;        
    } else {
      if (this.amForm.get('phoneNumber').value && this.amForm.get('phoneNumber').value.e164Number) {
        let phoneObj = this.amForm.get('phoneNumber');
        let dialCode = phoneObj.value.dialCode;
        let phoneNumber = phoneObj.value.e164Number.split(dialCode)[1];
        if (phoneObj.status == 'VALID') {
          invalid = false;
        } else if (phoneNumber && phoneNumber.startsWith('55')) {
          invalid = false;
        } else {
          invalid = true;
        }
      } else {
        invalid = true;
      }
    }
    return invalid;
}
}

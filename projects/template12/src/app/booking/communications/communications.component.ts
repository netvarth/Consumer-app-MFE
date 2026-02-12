import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormMessageDisplayService, projectConstantsLocal } from 'jconsumer-shared';
import { IntlTelInputLoaderService } from '../../shared/intl-tel-input-loader.service';

@Component({
  selector: 'app-communications',
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.css']
})
export class CommunicationsComponent implements OnInit {

  @Input() selectedService;
  @Output() setCommunications = new EventEmitter<any>();
  @Input() commObj;
  @Input() mode;
  emailerror = null;
  whatsapperror = '';
  phoneError = '';
  commForm: FormGroup;
  preferredCountries = ['in', 'uk', 'us'];
  separateDialCode = true;
  textLabels = {
    mainLabel: null,
    codePlaceholder: 'Code',
    searchPlaceholderLabel: 'Search',
    noEntriesFoundLabel: 'No countries found',
    nationalNumberLabel: null,
    hintLabel: null,
    invalidNumberError: 'Number is not valid',
    requiredError: 'This field is required'
  }

  constructor(
    private fb: FormBuilder,
    public fed_service: FormMessageDisplayService,
    public intlTelInputLoader: IntlTelInputLoaderService
  ) { }

  ngOnInit(): void {
    console.log("In ngInit")
    console.log("this.commObj",this.commObj);
    this.commForm = this.fb.group({
      mobileNumber: [""],
      whatsAppNumber: [null],
      emailId: [
        "",
        Validators.compose([
          Validators.pattern(projectConstantsLocal.VALIDATOR_EMAIL)
        ])
      ]
    })
    if (this.commObj.communicationPhNo) {
      let phoneNumber = {
        e164Number:(this.commObj.communicationPhCountryCode + this.commObj.communicationPhNo)}
      this.commForm.get("mobileNumber")?.setValue(phoneNumber);
      setTimeout(() => this.commForm.get('mobileNumber')?.setValue(this.commObj.communicationPhNo), 500);
    }
    if (this.commObj.comWhatsappNo) {
      let whatsAppNumber = '' + this.commObj.comWhatsappCountryCode + this.commObj.comWhatsappNo;
      this.commForm.get("whatsAppNumber")?.setValue(whatsAppNumber);
      setTimeout(() => this.commForm.get('whatsAppNumber')?.setValue(this.commObj.comWhatsappNo), 500);
    }
    if (this.commObj.communicationEmail) {
      this.commForm.get("emailId")?.setValue(this.commObj.communicationEmail);
    }
  }
  /**
   * Set Fields to communication object and pass it to Root 
   */
  setCommFields() {
    if (this.commForm.get('mobileNumber').value) {
      let phoneNumber = this.commForm.get('mobileNumber').value;
      console.log(phoneNumber);
      if (phoneNumber.e164Number) {
        this.commObj.communicationPhCountryCode = phoneNumber['dialCode'];
        this.commObj.communicationPhNo = phoneNumber.e164Number.split(phoneNumber['dialCode'])[1];
      } else {
        this.commObj.communicationPhCountryCode = '';
        this.commObj.communicationPhNo = '';
      }
    }
    if (this.commForm.get('whatsAppNumber').value && this.commForm.get('whatsAppNumber').status === 'VALID') {
      let phoneNumber = this.commForm.get('whatsAppNumber').value;
      if (phoneNumber.e164Number) {
        this.commObj.whatsAppCountryCode = phoneNumber['dialCode'];
        this.commObj.comWhatsappNo = phoneNumber.e164Number.split(phoneNumber['dialCode'])[1];
      }
    }
    this.commObj.communicationEmail = this.commForm.get('emailId').value;
    console.log(this.commObj);
    this.setCommunications.emit(this.commObj);
  }
}

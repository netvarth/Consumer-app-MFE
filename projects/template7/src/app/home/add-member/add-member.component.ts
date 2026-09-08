import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CommonService, DateTimeProcessor, Messages, SharedService } from 'jconsumer-shared';
import { IntlTelInputLoaderService } from '../../shared/intl-tel-input-loader.service';

@Component({
  selector: 'app-consumer-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit {
  fill_foll_details_cap = Messages.FILL_FOLL_DETAILS_CAP;
  first_name_cap = Messages.F_NAME_CAP;
  last_name_cap = Messages.L_NAME_CAP;
  mobile_no = Messages.MOBILE_NUMBER_CAP;
  gender_cap = Messages.GENDER_CAP;
  male_cap = Messages.MALE_CAP;
  female_cap = Messages.FEMALE_CAP;
  dob_cap = Messages.DOB_CAP;

  firstname = '';
  lastname = '';
  title = '';
  mobile = '';
  countryCode = '';
  gender = '';
  dob;
  dobholder = '';
  api_error = null;
  api_success = null;
  parent_id;
  tday = new Date();
  minday = new Date(1900, 0, 1);

  @Input() calledFrom: any;
  @Input() consumerData;
  @Output() returnDetails = new EventEmitter<any>();
  countryCode_whtsap: any = '+91';
  whatsappnumber: any;
  telegramnumber: any;
  countryCode_telegram: any = '+91';
  email: any;
  beforeDelete: boolean;
  genderList: any = ['male', 'female', 'other'];
  selectedMessage = {
    files: [],
    base64: [],
    caption: []
  };
  base64ImageInfo;
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
  address: any;
  mobileNumber: any;
  cdnPath: string = '';
  constructor(
    public dialogRef: MatDialogRef<AddMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService,
    private commonService: CommonService,
    private dateTimeProcessor: DateTimeProcessor,
    private sharedService: SharedService,
    public intlTelInputLoader: IntlTelInputLoaderService
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    console.log('AddMemberComponent', data)
    if (data && data[0] && data[0].requestType && data[0].requestType === 'deactiveAccount') {
      this.beforeDelete = true;
    }
    if (data && data.type && data.type === 'edit') {
      console.log("Member Data", data);
      this.firstname = data.member.firstName || '';
      this.title = data.member.title || '';
      this.lastname = data.member.lastName || '';
      this.countryCode = data.member.countryCode || '';
      this.mobileNumber = {
        e164Number: (this.countryCode + this.data.member.phoneNo)
      }
      this.gender = data.member.gender || '';
      if (data.member.dob) {
        this.dob = new Date(data.member.dob) || '';
        this.dobholder = data.member.dob || '';
      }
      this.email = data.member.email || '';
      this.address = data.member.address || '';
      console.log("Email Updated :", this.email);
      if (data && data.member && data.member && data.member.whatsAppNum) {
        if (data.member.whatsAppNum.countryCode != '' && data.member.whatsAppNum.number != '') {
          this.whatsappnumber = {
            e164Number: (data.member.whatsAppNum.countryCode + data.member.whatsAppNum.number)
          }
        }
      }
      if (data && data.member && data.member && data.member.telegramNum) {
        if (data.member.telegramNum.countryCode != '' && data.member.telegramNum.number != '') {
          this.telegramnumber = {
            e164Number: (data.member.telegramNum.countryCode + data.member.telegramNum.number)
          }
        }
      }
    }
  }

  ngOnInit() {
    console.log('AddMemberComponent', this.consumerData)
    if (this.consumerData) {
      this.mobileNumber = {
        e164Number: (this.consumerData.countryCode + this.consumerData.primaryPhoneNumber)
      }
      this.countryCode = this.consumerData.countryCode || '';
      if (this.consumerData.whatsAppNum.countryCode != '' && this.consumerData.whatsAppNum.number != '') {
        this.whatsappnumber = {
          e164Number: (this.consumerData.whatsAppNum.countryCode + this.consumerData.whatsAppNum.number)
        }
      }
      if (this.consumerData.telegramNum.countryCode != '' && this.consumerData.telegramNum.number != '') {
        this.telegramnumber = {
          e164Number: (this.consumerData.telegramNum.countryCode + this.consumerData.telegramNum.number)
        }
      }
      this.email = this.consumerData.email || '';
    }
  }
  isNumericSign(evt) {
    return this.commonService.isNumericSign(evt);
  }
  valuechange(event) {
    const retobj = {
      'fname': this.firstname || '',
      'title': this.title || '',
      'lname': this.lastname || '',
      'phone': this.mobile || '',
      'gender': this.gender || '',
      'email': this.email,
      'address': this.address,
      'countryCode': this.countryCode
    };
    if (this.dob) {
      this.dobholder = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(this.dob);
      retobj['dob'] = this.dobholder;
    }
    if (this.mobileNumber) {
      if (this.mobileNumber.e164Number) {
        retobj['countryCode'] = this.mobileNumber['dialCode'];
        retobj['phone'] = this.mobileNumber.e164Number.split(this.mobileNumber['dialCode'])[1];
      } else {
        retobj['countryCode'] = this.consumerData.countryCode;
        retobj['phone'] = this.consumerData.primaryPhoneNumber;
      }
    } else {
      retobj['countryCode'] = '';
      retobj['phone'] = '';
    }
    if (this.whatsappnumber) {
      if (this.whatsappnumber.e164Number) {
        retobj['countryCode_whtsap'] = this.whatsappnumber['dialCode'];
        retobj['whatsappnumber'] = this.whatsappnumber.e164Number.split(this.whatsappnumber['dialCode'])[1];
      } else {
        retobj['countryCode_whtsap'] = this.consumerData.whatsAppNum.countryCode;
        retobj['whatsappnumber'] = this.consumerData.whatsAppNum.number;
      }
    } else {
      retobj['countryCode_whtsap'] = '';
      retobj['whatsappnumber'] = '';
    }
    if (this.telegramnumber) {
      if (this.telegramnumber.e164Number) {
        retobj['countryCode_telegram'] = this.telegramnumber['dialCode'];
        retobj['telegramnumber'] = this.telegramnumber.e164Number.split(this.telegramnumber['dialCode'])[1];
      } else {
        retobj['countryCode_telegram'] = this.consumerData.telegramNum.countryCode;
        retobj['telegramnumber'] = this.consumerData.telegramNum.number;
      }
    } else {
      retobj['countryCode_telegram'] = '';
      retobj['telegramnumber'] = '';
    }
    console.log("retobj", retobj);
    this.returnDetails.emit(retobj);
  }
  dateChanged(e) {
    this.valuechange(e);
  }
  resetApiErrors() {
    this.api_error = null;
    this.api_success = null;
  }
  isNumeric(evt) {
    console.log('evt', evt);
    const returnValue = this.commonService.isNumeric(evt);
    console.log('returnValue', returnValue);
    return returnValue;
  }
  deActiveAccount() {
    let user;
    if (this.data && this.data[1] && this.data[1].data) {
      user = this.data[1].data;
      console.log('user', user);
      this.beforeDelete = false;
      this.dialogRef.close('afterResClose')
    }
  }
  closeDialog(txt) {
    console.log(txt);
    this.dialogRef.close(txt)
  }
}

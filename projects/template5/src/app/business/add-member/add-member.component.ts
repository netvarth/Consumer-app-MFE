import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'jaldee-framework/shared';
import { Messages } from 'jaldee-framework/constants';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { StorageService } from '../../services/storage.service';
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
  title ='';
  mobile = '';
  countryCode ='';
  gender = '';
  dob;
  dobholder = '';
  api_error = null;
  api_success = null;
  parent_id;
  tday = new Date();
  minday = new Date(1900, 0, 1);

  @Input() calledFrom: any;
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
  SearchCountryField = SearchCountryField;
  selectedCountry = CountryISO.India;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedKingdom, CountryISO.UnitedStates];
  separateDialCode = true;
  address: any;
  mobileNumber: any;
  salutation:any;


  constructor(
    public dialogRef: MatDialogRef<AddMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService,
    private sharedService: SharedService,
    private storageService:StorageService,
    private dateTimeProcessor: DateTimeProcessor
  ) {
    console.log('AddMemberComponent', data)
    if (data && data[0] && data[0].requestType && data[0].requestType === 'deactiveAccount') {
      this.beforeDelete = true;storageService
    }
    if (data && data.type && data.type === 'edit') {
      console.log("Member Data", data);
      this.firstname = data.member.firstName || '';
      this.title = data.member.title || '';
      this.lastname = data.member.lastName || '';
      this.mobileNumber = data.member.countryCode + data.member.phoneNo || '';
      setTimeout(() => this.mobileNumber = data.member.phoneNo, 500);
      // this.mobileNumber['dialCode']
      this.countryCode = data.member.countryCode || '';
      this.gender = data.member.gender || '';
      if (data.member.dob) {
        this.dob = new Date(data.member.dob) || '';
        this.dobholder = data.member.dob || '';
      }
      this.email = data.member.email || '';
      this.address = data.member.address || '';
      console.log("Email Updated :", this.email);
      // if (data && data.member && data.member && data.member.whatsAppNum) {
      //   if (data.member.whatsAppNum.countryCode != '') {
      //     this.countryCode_whtsap = data.member.whatsAppNum.countryCode;
      //   }
      //   if (data.member.whatsAppNum.number != '') {
      //     this.whatsappnumber = data.member.whatsAppNum.number;
      //   }
      // }
      // console.log(data.member.telegramNum);
      // if (data && data.member && data.member && data.member.telegramNum) {
      //   if (data.member.telegramNum.countryCode != '') {
      //     this.countryCode_telegram = data.member.telegramNum.countryCode;
      //   }
      //   if (data.member.telegramNum.number != '') {
      //     this.telegramnumber = data.member.telegramNum.number;
      //   }
      // }
      if (data && data.member && data.member.whatsAppNum) {
        if (data.member.whatsAppNum.countryCode != '' && data.member.whatsAppNum.number != '') {
          this.whatsappnumber = data.member.whatsAppNum.countryCode + data.member.whatsAppNum.number;
          setTimeout(() => this.whatsappnumber = data.member.whatsAppNum.number, 500);
          
        }        
      }
      console.log(data.member.telegramNum);
      if (data && data.member && data.member.telegramNum) {
        if (data.member.telegramNum.countryCode != '' && data.member.telegramNum.number != '') {
          this.telegramnumber =  data.member.telegramNum.countryCode + data.member.telegramNum.number;        
          setTimeout(() => this.telegramnumber = data.member.telegramNum.number, 500);
      }
    }
    }
  }

  ngOnInit() {
    this.storageService.getSalutations().then((data: any) => { 
      console.log('accountStorageService123', data) 
      this.salutation = data;
    });
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable'))) 
  }
  isNumericSign(evt) {
    return this.sharedService.isNumericSign(evt);
  }
  valuechange(event) {
    console.log("Gender:", this.gender);
    console.log("Calendar:", this.dob);
    
    console.log(this.dobholder);
    const retobj = {
      'fname': this.firstname || '',
      'lname': this.lastname || '',
      'title': this.title || '',
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
        retobj['countryCode'] = '';
        retobj['phone'] = '';
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
        retobj['countryCode_whtsap'] = '';
        retobj['whatsappnumber'] = '';
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
        retobj['countryCode_telegram'] = '';
        retobj['telegramnumber'] = '';
      }
    } else {
      retobj['countryCode_telegram'] = '';
      retobj['telegramnumber'] = '';
    }
    // if(this.countryCode_whtsap || this.whatsappnumber || this.countryCode_telegram || this.telegramnumber){
    //   retobj['event']=event;
    // }
    // else{
    //   return event=false
    // }
    console.log(retobj);
    this.returnDetails.emit(retobj);
  }
  dateChanged(e) {
    // let e = new Date(event);
    // this.dateTimeProcessor.getStringFromDate_YYYYMMDD(e);
    // if (e) {
    //   if (e._i) {
    //     let cday = e.value._i.date;
    //     let cmon = (e.value._i.month + 1);
    //     const cyear = e.value._i.year;
    //     if (cday < 10) {
    //       cday = '0' + cday;
    //     }
    //     if (cmon < 10) {
    //       cmon = '0' + cmon;
    //     }
    //     this.dobholder = cyear + '-' + cmon + '-' + cday;
    //   }
    // } else {
    //   this.dobholder = '';
    // }
    this.valuechange(e);
  }
  resetApiErrors() {
    this.api_error = null;
    this.api_success = null;
  }
  isNumeric(evt) {
    console.log('evt', evt);
    const returnValue = this.sharedService.isNumeric(evt);
    console.log('returnValue', returnValue);
    return returnValue;
  }
  deActiveAccount() {
    let user;
    if (this.data && this.data[1] && this.data[1].data) {
      user = this.data[1].data;
      console.log('user', user);
      this.beforeDelete = false;
      // this.dialogRef.close('afterResClose')
      this.dialogRef.close('afterResClose')
    }
  }
  closeDialog(txt) {
    console.log(txt);
    this.dialogRef.close(txt)
  }
  // getImage(text, data) {
  //   console.log(text);
  //   console.log(data);
  //   return './assets/images/myjaldee/defultUser.png'

  // }
  // filesSelected(event) {
  //   const input = event.target.files;
  //   if (input) {
  //     for (const file of input) {
  //       if (projectConstantsLocal.IMAGE_FORMATS.indexOf(file.type) === -1) {
  //         this.snackbarService.openSnackBar('Selected image type not supported', { 'panelClass': 'snackbarerror' });
  //       } else if (file.size > projectConstantsLocal.IMAGE_MAX_SIZE) {
  //         this.snackbarService.openSnackBar('Please upload images with size < 10mb', { 'panelClass': 'snackbarerror' });
  //       } else {
  //         this.selectedMessage.files.push(file);
  //         const reader = new FileReader();
  //         reader.onload = (e) => {
  //           this.selectedMessage.base64.push(e.target['result']);
  //         };
  //         reader.readAsDataURL(file);
  //         console.log('this.selectedMessageFinal', this.selectedMessage)
  //         this.saveDigitalSignImages();
  //       }
  //     }
  //   }
  // }
  // saveDigitalSignImages() {
  //   const submit_data: FormData = new FormData();
  //   const propertiesDetob = {};
  //   let i = 0;
  //   for (const pic of this.selectedMessage.files) {
  //     submit_data.append('files', pic, pic['name']);
  //     const properties = {
  //       'caption': this.selectedMessage.caption[i] || ''
  //     };
  //     propertiesDetob[i] = properties;
  //     i++;
  //   }
  //   const propertiesDet = {
  //     'propertiesMap': propertiesDetob
  //   };
  //   const blobPropdata = new Blob([JSON.stringify(propertiesDet)], { type: 'application/json' });
  //   submit_data.append('properties', blobPropdata);
  // }
  // removeUser(data) {
  //   console.log(data);
  //   // let index=this.selectedMessage.files[0]
  //   this.selectedMessage.files.splice(this.selectedMessage.files[0], 1);
  //   this.selectedMessage.base64.splice(this.selectedMessage.base64[0], 1);
  //   this.selectedMessage.caption.splice(this.selectedMessage.caption[0], 1);

  // }

  

}

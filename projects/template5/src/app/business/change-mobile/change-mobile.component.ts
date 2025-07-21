import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../../services/account-service';
import { AuthService } from '../../services/auth-service';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { FormMessageDisplayService } from 'jaldee-framework/form-message';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { ErrorMessagingService } from 'jaldee-framework/error-messaging';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { SharedService } from 'jaldee-framework/shared';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
@Component({
  selector: 'app-change-mobile',
  templateUrl: './change-mobile.component.html',
  styleUrls: ['./change-mobile.component.css']

})
export class ChangeMobileComponent implements OnInit {

  mobile_cap = Messages.CHANGEMOBILE_CAP;
  your_curmob_msg = Messages.CURRENTMOBMSG;
  verified_cap = Messages.PHONE_VERIFIED;
  save_btn_cap = Messages.SAVE_BTN;
  related_links_cap = Messages.RELATED_LINKS;
  user_profile_cap = Messages.USER_PROF_CAP;
  add_change_email_cap = Messages.ADD_CHANGE_EMAIL;
  family_members_cap = Messages.FAMILY_MEMBERS;
  changemob_cap = Messages.CHANGE_MOB_CAP;
  dashboard_cap = Messages.DASHBOARD_TITLE;
  spForm: UntypedFormGroup;
  api_error = null;
  api_success = null;
  is_verified = false;
  user_details;
  prev_phonenumber;
  countryCode = 91;
  currentcountryCode;
  step = 1;
  curtype;
  usertype;
  countrycodesymbol = '+'
  submit_data: any = {};
  accountId: any;
  customId: any;
  theme: any;
  fromApp: boolean;
  accountProfile: any;
  account: any;
  accountConfig: any;
  SearchCountryField = SearchCountryField;
  selectedCountry = CountryISO.India;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedKingdom, CountryISO.UnitedStates];
  separateDialCode = true;
  constructor(private fb: UntypedFormBuilder,
    public fed_service: FormMessageDisplayService,
    public router: Router,
    private location: Location,
    private wordProcessor: WordProcessor,
    private snackbarService: SnackbarService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    public translate: TranslateService,
    private sharedService: SharedService,
    private accountService: AccountService,
    private authService: AuthService,
    private errorService: ErrorMessagingService
  ) { }
  goBack() {
    this.location.back();
  }
  ngOnInit() {
    this.account = this.accountService.getAccountInfo();
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.spForm = this.fb.group({
      phonenumber: ['', Validators.compose(
        [Validators.required])]
    });
    this.getProfile();
  }
  getProfile() {
    const ob = this;
    const consumer = this.groupService.getitemFromGroupStorage('ynw-user');
    this.user_details = consumer;
    this.step = 1;
    this.prev_phonenumber = consumer['primaryPhoneNumber'];
    this.currentcountryCode = consumer['countryCode'];
    this.is_verified = consumer['phoneVerified'];
  }
  public bothnumberandcountrycode;
  onSubmit(submit_data) {
    let phoneInfo = {};
    let phoneNumber = submit_data.phonenumber;
    phoneInfo['countryCode'] = phoneNumber['dialCode'];
    phoneInfo['phonenumber'] = phoneNumber.e164Number.split(phoneNumber['dialCode'])[1];
    this.resetApiErrors();
    this.authService.verifyNewPhone(phoneInfo['phonenumber'], 'consumer', phoneInfo['countryCode'])
      .subscribe(
        () => {
          this.step = 2;
          this.submit_data = phoneInfo;
          setTimeout(() => {
            this.api_success = '';
            this.spForm.reset();
          }, projectConstantsLocal.TIMEOUT_DELAY_LARGE6);
        },
        error => {
          let errorObj = this.errorService.getApiError(error);
          this.api_error = this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies());
          this.snackbarService.openSnackBar('Please recheck the country code and number', { 'panelClass': 'snackbarerror' });
        }
      );
  }
  isVerified(data) {
    if (this.user_details.userProfile.primaryMobileNo === data) {
      this.is_verified = true;
    } else {
      this.is_verified = false;
    }
  }
  resetApiErrors() {
    this.api_error = null;
  }
  resendOtp(phonenumber) {
    this.onSubmit(phonenumber);
  }
  isNumericSign(evt) {
    return this.sharedService.isNumericSign(evt);
  }
  onOtpSubmit(submit_data) {
    this.resetApiErrors();
    const post_data = {
      'countryCode': this.submit_data.countryCode,
      'loginId': this.submit_data.phonenumber,
      'accountId': this.accountId
    };
    this.authService.verifyNewPhoneOTP(submit_data, post_data, 'consumer')
      .subscribe(
        () => {
          console.log(this.submit_data.phonenumber);
          this.api_success = null;
          this.snackbarService.openSnackBar(Messages.PHONE_VERIFIED, { 'panelClass': 'snackbarnormal' });
          const ynw = this.accountService.getJson(this.lStorageService.getitemfromLocalStorage('ynw-credentials'));
          console.log(ynw)// get the credentials from local storage variable
          ynw['loginId'] = this.submit_data.phonenumber; // change the phone number to the new one in the local storage variable
          ynw['countryCode'] = this.submit_data.countryCode;
          this.prev_phonenumber = this.submit_data.phonenumber;
          this.currentcountryCode = this.submit_data.countryCode;
          let ynwUser = this.groupService.getitemFromGroupStorage('ynw-user');
          ynwUser['countryCode'] = this.currentcountryCode;
          ynwUser['primaryPhoneNumber'] = this.submit_data.phonenumber;
          this.groupService.setitemToGroupStorage('ynw-user', ynwUser);
          this.lStorageService.setitemonLocalStorage('ynw-credentials', ynw); // saving the updation to the local storage variable
          setTimeout(() => {
            this.location.back();
          }, projectConstantsLocal.TIMEOUT_DELAY);
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }

  isNumeric(evt) {
    return this.sharedService.isNumeric(evt);
  }
  redirectto(mod) {
    switch (mod) {
      case 'profile':
        this.router.navigate([this.customId, 'profile']);
        break;
      case 'change-password':
        this.router.navigate([this.customId, 'change-password']);
        break;
      case 'members':
        this.router.navigate([this.customId, 'members']);
        break;
    }
  }

  isFormInvalid() {
    let invalid = true;
    if (this.spForm.get('phonenumber').value) {
      let phoneObj = this.spForm.get('phonenumber');
      let dialCode = phoneObj.value.dialCode;
      let phoneNumber = phoneObj.value.e164Number.split(dialCode)[1];
      if (phoneObj.value.e164Number == ('+' + this.countryCode + this.prev_phonenumber)) {
        invalid = true;
      } else if (phoneObj.status == 'VALID') {
        invalid = false;
      } else if (phoneNumber && phoneNumber.startsWith('55')) {
        invalid = false;
      } else {
        invalid = true;
      }
    } else {
      invalid = true;
    }
    return invalid;
  }
}

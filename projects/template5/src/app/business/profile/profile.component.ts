import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { ErrorMessagingService } from 'jaldee-framework/error-messaging';
import { SharedService } from 'jaldee-framework/shared';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { FormMessageDisplayService } from 'jaldee-framework/form-message';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { FileService } from 'jaldee-framework/file';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { SubscriptionService } from 'jaldee-framework/subscription';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { AccountService } from '../../services/account-service';
import { AuthService } from '../../services/auth-service';
import { ConsumerService } from '../../services/consumer-service';
import { StorageService } from '../../services/storage.service';
import { AddMemberComponent } from '../add-member/add-member.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  first_name_cap = Messages.F_NAME_CAP;
  last_name_cap = Messages.L_NAME_CAP;
  gender_cap = Messages.GENDER_CAP;
  male_cap = Messages.MALE_CAP;
  female_cap = Messages.FEMALE_CAP;
  date_of_birth_cap = Messages.DOB_CAP;
  phone_no_cap = Messages.PHONE_NO_CAP;
  email_id_cap = Messages.EMAIL_ID_CAP;
  email_cap = Messages.EMAIL_CAP;
  update_btn = Messages.UPDATE_BTN;
  related_links_cap = Messages.RELATED_LINKS;
  change_mobile_cap = Messages.CHANGE_MOB_CAP;
  change_email_cap = Messages.ADD_CHANGE_EMAIL;
  family_members_cap = Messages.FAMILY_MEMBERS;
  dashboard_cap = Messages.DASHBOARD_TITLE;
  editProfileForm: UntypedFormGroup;
  private subs = new SubSink();
  api_error = null;
  api_success = null;
  curtype;
  maxalloweddate = '';
  tday = new Date();
  minday = new Date(1900, 0, 1);
  emailHolder = '';
  phonenoHolder = '';
  countryCode = '';
  fnameerror = null;
  lnameerror = null;
  emailerror = null;
  email1error = null;
  confrmshow = false;
  domain;
  loading = false;
  tele_arr: any = [];
  chatId;
  val: any = [];
  telegramstat = true;
  status = false;
  boturl: any;
  telegramdialogRef: any;
  waitlist_statusstr: string;
  customId: any;
  theme;
  fromApp = false;
  tel_stat: string;
  moment: any;
  account: any;
  accountProfile: any;
  smallDevice: boolean;
  genderList: any = ['male', 'female', 'other'];
  profileData;
  profileImageInfo: any;
  selectedMessage = {
    files: [],
    base64: [],
    caption: []
  };
  fileUploadRes: any = [];
  profileInfo: any = [];
  spConsumer;
  profilePicture: any;
  filesToUpload: any = [];
  SearchCountryField = SearchCountryField;
  selectedCountry = CountryISO.India;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedKingdom, CountryISO.UnitedStates];
  separateDialCode = true;
  salutation: any;

  constructor(private fb: UntypedFormBuilder,
    public fed_service: FormMessageDisplayService,
    public router: Router,
    public authService: AuthService,
    private location: Location,
    private wordProcessor: WordProcessor,
    private _location: Location,
    public dialog: MatDialog,
    private snackbarService: SnackbarService,
    private activated_route: ActivatedRoute,
    public translate: TranslateService,
    private accountService: AccountService,
    private consumerService: ConsumerService,
    private sharedService: SharedService,
    private dateTimeProcessor: DateTimeProcessor,
    private errorService: ErrorMessagingService,
    private groupService: GroupStorageService,
    private fileService: FileService,
    private storageService:StorageService,
    private subscriptionService: SubscriptionService
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
  }
  goBack() {
    this.location.back();
  }
  ngOnInit() {
    this.onResize();
    this.account = this.accountService.getAccountInfo();
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    const user = this.groupService.getitemFromGroupStorage('ynw-user');
    this.domain = user.sector;
    this.storageService.getSalutations().then((data: any) => { 
      this.salutation = data;
    });
    this.editProfileForm = this.fb.group({
      titles: [''],
      first_name: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
      last_name: ['', Validators.compose([Validators.required, Validators.pattern(projectConstantsLocal.VALIDATOR_CHARONLY)])],
      gender: [''],
      dob: [''],
      phoneNo: [''],
      countryCode: [''],
      email: ['',Validators.compose([Validators.pattern(projectConstantsLocal.VALIDATOR_EMAIL)])],
      email1:['',Validators.compose([Validators.pattern(projectConstantsLocal.VALIDATOR_EMAIL)])],
      whatsappnumber: [''],
      telegramnumber: ['']
    });
    const month = (this.tday.getMonth() + 1);
    let dispmonth = '';
    if (month < 10) {
      dispmonth = '0' + month;
    } else {
      dispmonth = month.toString();
    }
    this.maxalloweddate = this.tday.getFullYear() + '-' + dispmonth + '-' + this.tday.getDate();
    this.getProfile();
    this.getTelegramstat();
  }
  onResize() {
    if (window.innerWidth <= 767) {
      this.smallDevice = true;
    } else {
      this.smallDevice = false;
    }
  }
  getProfile() {
    const _this = this;
    this.loading = true;
    this.consumerService.getProviderConsumer().subscribe(
      (spConsumer: any) => {
        this.spConsumer = spConsumer;
        let ynwUser = _this.groupService.getitemFromGroupStorage('ynw-user');
        ynwUser['userName'] = (spConsumer.title ? (spConsumer.title + ' ') : '') + spConsumer.firstName + ' ' +(spConsumer.lastName ? (spConsumer.lastName + ' ') : '');
        ynwUser['firstName'] = spConsumer.firstName;
        ynwUser['title'] = spConsumer.title;
        ynwUser['lastName'] = spConsumer.lastName;
        ynwUser['email'] = spConsumer.email;
        ynwUser['countryCode'] = spConsumer.countryCode;
        if (spConsumer['whatsAppNum']) {
          ynwUser['whatsAppNum'] = spConsumer['whatsAppNum'];
        }
        if (spConsumer['telegramNum']) {
          ynwUser['telegramNum'] = spConsumer['telegramNum'];
        }
        _this.groupService.setitemToGroupStorage('ynw-user', ynwUser);
        this.loading = false;
        let data = {};
        data['userProfile'] = spConsumer;
        this.editProfileForm.patchValue({
          titles: data['userProfile']['title'] || null,
          first_name: data['userProfile']['firstName'] || null,
          last_name: data['userProfile']['lastName'] || null,
          gender: data['userProfile']['gender'] || null,          
          email: data['userProfile']['email'] || '',
          email1: data['userProfile']['email'] || ''
        });
        if (data['userProfile']['dob']) {
          this.editProfileForm.get('dob').patchValue(new Date(data['userProfile']['dob']));
        }
        this.phonenoHolder = data['userProfile']['phoneNo'] || '';
        this.countryCode = data['userProfile']['countryCode'] || '';
        if (data['userProfile']['phoneNo'].trim() != '') {
          let phone = data['userProfile']['countryCode'] + data['userProfile']['phoneNo'];
          this.editProfileForm.get('phoneNo').patchValue(phone);
          setTimeout(() => {
            this.editProfileForm.get('phoneNo').patchValue(data['userProfile']['phoneNo']);
          }, 500);
        }
        if (data['userProfile']['whatsAppNum'] && data['userProfile']['whatsAppNum']['number'].trim() != '') {
          let whatsAppNum = data['userProfile']['whatsAppNum']['countryCode'] + data['userProfile']['whatsAppNum']['number'];
          this.editProfileForm.get('whatsappnumber').patchValue(whatsAppNum);
          setTimeout(() => {
            this.editProfileForm.get('whatsappnumber').patchValue(data['userProfile']['whatsAppNum']['number']);
          }, 500);
        }
        if (data['userProfile']['telegramNum'] && data['userProfile']['telegramNum']['number'].trim() != '') {
          let telegramNumber = data['userProfile']['telegramNum']['countryCode'] + data['userProfile']['telegramNum']['number'];
          this.editProfileForm.get('telegramnumber').patchValue(telegramNumber);
          setTimeout(() => {
            this.editProfileForm.get('telegramnumber').patchValue(data['userProfile']['telegramNum']['number']);
          }, 500);
        }
        if (spConsumer && spConsumer['consumerPhoto'] && spConsumer['consumerPhoto'][0] && spConsumer['consumerPhoto'][0].s3path) {
          this.profilePicture = spConsumer['consumerPhoto'][0].s3path;
        }
        this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
        this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
      },
      error => {
        let errorObj = this.errorService.getApiError(error);
        this.api_error = this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies());
        this.loading = false;
        this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
        this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
      }
    );
  }
  onSubmit(sub_data) {
    let date_format = null;
    if (sub_data.dob != null) {
      const date = new Date(sub_data.dob);
      date_format = this.moment(date).format(projectConstantsLocal.POST_DATE_FORMAT);
    }
    let post_data;
    const curuserdet = this.spConsumer;
    if (sub_data.email) {
      const stat = this.validateEmail(sub_data.email);
      if (!stat) {
        this.emailerror = 'Please enter a valid email.';
      }
    }
    if (sub_data.email1) {
      const stat1 = this.validateEmail(sub_data.email1);
      if (!stat1) {
        this.email1error = 'Please enter a valid email.';
      }
    }
    if (sub_data.first_name.trim() === '') {
      this.fnameerror = 'First name is required';
    }
    if (sub_data.last_name.trim() === '') {
      this.lnameerror = 'Last name is required';
    }
    if (this.fnameerror !== null || this.lnameerror !== null) {
      return;
    }
    if (sub_data.email === sub_data.email1) {
      post_data = {
        'id': curuserdet['id'] || null,
        'title': sub_data.titles || null,
        'firstName': sub_data.first_name.trim() || null,
        'lastName': sub_data.last_name.trim() || null,
        'dob': date_format || null,
        'gender': (sub_data.gender !== '') ? sub_data.gender : null || null,
        'email': sub_data.email || ''
      };
      if (sub_data.phoneNo) {
        let phoneNumber = sub_data.phoneNo;
        if (phoneNumber.e164Number) {
          post_data['countryCode'] = phoneNumber['dialCode'];
          post_data['phoneNo'] = phoneNumber.e164Number.split(phoneNumber['dialCode'])[1];
        } else {
          post_data['countryCode'] = '';
          post_data['phoneNo'] = '';
        }
      } else {
        post_data['countryCode'] = '';
        post_data['phoneNo'] = '';
      }
      if (sub_data.whatsappnumber) {
        let phoneNumber = sub_data.whatsappnumber;
        let whatsApp = {};
        if (phoneNumber.e164Number) {
          whatsApp['countryCode'] = phoneNumber['dialCode'];
          whatsApp['number'] = phoneNumber.e164Number.split(phoneNumber['dialCode'])[1];
        } else {
          whatsApp['countryCode'] = '';
          whatsApp['number'] = '';
        }
        post_data['whatsAppNum'] = whatsApp;
      } else {
        let whatsApp = {};
        whatsApp['countryCode'] = '';
        whatsApp['number'] = '';
        post_data['whatsAppNum'] = whatsApp;
      }
      if (sub_data.telegramnumber) {
        let phoneNumber = sub_data.telegramnumber;
        let telegram = {};
        if (phoneNumber.e164Number) {
          telegram['countryCode'] = phoneNumber['dialCode'];
          telegram['number'] = phoneNumber.e164Number.split(phoneNumber['dialCode'])[1];
        } else {
          telegram['countryCode'] = '';
          telegram['number'] = '';
        }
        post_data['telegramNum'] = telegram;
      } else {
        let telegram = {};
        telegram['countryCode'] = '';
        telegram['number'] = '';
        post_data['telegramNum'] = telegram;
      }
      this.consumerService.updateSPConsumer(post_data)
        .subscribe(
          () => {
            this.snackbarService.openSnackBar(Messages.PROFILE_UPDATE, { 'panelClass': 'snackbarnormal' });
            this.getProfile();
          },
          error => {
            this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          }
        );
    } else {
      this.snackbarService.openSnackBar(Messages.EMAIL_MISMATCH, { 'panelClass': 'snackbarerror' });
    }
  }
  validateEmail(mail) {
    const emailField = mail;
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(emailField) === false) {
      return false;
    }
    return true;
  }
  isNumeric(evt) {
    return this.sharedService.isNumeric(evt);
  }
  isNumericSign(evt) {
    return this.sharedService.isNumericSign(evt);
  }
  resetApiErrors() {
    this.api_error = null;
    this.api_success = null;
    this.fnameerror = null;
    this.lnameerror = null;
    this.emailerror = null;
    this.email1error = null;
  }
  showConfrmEmail(event) {
    if (event.key !== 'Enter') {
      this.confrmshow = true;
    }
  }
  resetdob() {
    this.editProfileForm.get('dob').setValue(null);
  }
  redirecToSettings() {
    this._location.back();
  }
  enableTelegram(event) {
    if (event.source.checked) {
      const stat = event.source.checked ? 'ENABLED' : 'DISABLED';
      if (stat === 'ENABLED') {
        this.waitlist_statusstr = 'On';
      }
      else {
        this.waitlist_statusstr = 'Off';
      }
      this.consumerService.consumertelegramChat(this.removePlus(this.countryCode), this.phonenoHolder).subscribe(data => {
        this.chatId = data;
      })

    }
    if (this.status === true) {
      this.tel_stat = 'DISABLED'
      this.teleGramStat(this.tel_stat).then(
        (data) => {
          this.getTelegramstat();
        },
        error => {
          this.telegramstat = false;
          if (!this.telegramstat || this.chatId === null) {
            // this.telegramInfo();
          }
        });
    }
    else if (this.status === false) {
      this.tel_stat = 'ENABLED'

      this.teleGramStat(this.tel_stat).then(
        (data) => {
          this.getTelegramstat();
        },
        error => {
          this.telegramstat = false;
          if (!this.telegramstat || this.chatId === null) {
            // this.telegramInfo();
          }
        });
    }
    if (event.source.checked === false) {
      this.waitlist_statusstr = 'Off';

    }
  }
  teleGramStat(stat) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.consumerService.enableTelegramNoti(stat)
        .subscribe(
          data => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
  getTelegramstat() {
    this.consumerService.getTelegramstat()
      .subscribe(
        (data: any) => {
          this.status = data.status;
          this.waitlist_statusstr = this.status === true ? 'On' : 'Off';
          if (data.botUrl) {
            this.boturl = data.botUrl;
          }
        });
  }
  removePlus(countryCode) {
    if (countryCode.startsWith('+')) {
      countryCode = countryCode.substring(1);
    }
    return countryCode;
  }
  redirectto(mod) {
    switch (mod) {
      case 'change-password':
        this.router.navigate([this.customId, 'change-password']);
        break;
      case 'change-mobile':
        this.router.navigate([this.customId, 'change-mobile']);
        break;
      case 'members':
        this.router.navigate([this.customId, 'members']);
        break;
      case 'dashboard':
        this.router.navigate([this.customId, 'dashboard']);
        break;
    }
  }
  deactiveaccount(mod) {
    const _this = this;
    const dialogref = this.dialog.open(AddMemberComponent, {
      // width: '50%',
      height: '50%',

      panelClass: ['popup-class', 'commonpopupmainclass'],
      disableClose: true,
      data: [{ requestType: 'deactiveAccount' }, { data: 'consumer' }]
    });
    dialogref.afterClosed().subscribe(
      result => {
        if (result === 'afterResClose') {
          // window.location.reload();
          this.consumerService.deactiveAccount('spconsumer').subscribe(() => {
            this.authService.doLogout().then(
              () => {
                _this.router.navigate([_this.accountService.getCustomId()]);
              }
            );
          });
        }
        else if (result === 'close') {
          dialogref.close()
        }
      }
    );
  }
  getImage(text, data) {
    // return './assets/images/myjaldee/defultUser.png'
  }
  removeUser() {
    const _this = this;
    _this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    let fileName: any;
    let fileSize: any;
    let fileType: any;
    if (this.spConsumer['consumerPhoto'][0] && this.spConsumer['consumerPhoto'][0]['fileName']) {
      fileName = this.spConsumer['consumerPhoto'][0]['fileName']
    }
    if (this.spConsumer['consumerPhoto'][0] && this.spConsumer['consumerPhoto'][0]['fileSize']) {
      fileSize = this.spConsumer['consumerPhoto'][0]['fileSize']
    }
    if (this.spConsumer['consumerPhoto'][0] && this.spConsumer['consumerPhoto'][0]['fileType']) {
      fileType = this.spConsumer['consumerPhoto'][0]['fileType']
    }
    let post_data: any = [];
    post_data = [
      {
        "owner": this.spConsumer.id,
        "fileName": fileName,
        "fileSize": fileSize,
        "action": 'remove',
        "caption": '',
        "fileType": fileType,
        "order": 0,
      }
    ]
    let postdata = post_data;
    _this.removeImageProfile(postdata).then((res) => {
      if (res) {
        _this.profilePicture = null;
        this.getProfile();
      }
    })
  }
  removeImageProfile(postdata) {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this.consumerService.removeProfilePhoto(_this.spConsumer.id, postdata).subscribe((res) => {
        resolve(res);
      }, ((error) => {
        reject(error);
        _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        _this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
      }))
    })
  }
  reemailhandle(data) {
    console.log(data);
  }

  filesSelected(event, type) {
    const input = event.target.files;
    let fileUploadtoS3 = [];
    const _this = this;
    this.subscriptionService.sendMessage({ ttype: 'loading_file_start' });
    this.fileService.filesSelected(event, _this.selectedMessage).then(
      () => {
        let index = _this.filesToUpload && _this.filesToUpload.length > 0 ? _this.filesToUpload.length : 0;
        for (const pic of input) {
          let size = pic["size"] / 1024;
          let fileObj = {
            owner: this.spConsumer.id,
            fileName: pic["name"],
            fileSize: size / 1024,
            caption: "",
            fileType: pic["type"].split("/")[1],
            action: 'add'
          }
          console.log("pic", pic)
          fileObj['file'] = pic;
          fileObj['type'] = type;
          fileObj['order'] = index;
          _this.filesToUpload.push(fileObj);
          fileUploadtoS3.push(fileObj);
          index++;
        }

        _this.consumerService.addProfilePhoto(_this.spConsumer.id, fileUploadtoS3).subscribe(
          (s3Urls: any) => {
            if (s3Urls && s3Urls.length > 0) {
              _this.uploadAudioVideo(s3Urls).then(
                () => {
                  _this.getProfile();
                });
            }
          }, error => {
            _this.snackbarService.openSnackBar(error,
              { panelClass: "snackbarerror" }
            );
            _this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
          }
        );
      }).catch((error) => {
        _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        _this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
      })
  }
  uploadAudioVideo(data) {
    const _this = this;
    let count = 0;
    return new Promise(async function (resolve, reject) {
      for (const s3UrlObj of data) {
        const file = _this.filesToUpload.filter((fileObj) => {
          return ((fileObj.order === (s3UrlObj.orderId)) ? fileObj : '');
        })[0];
        if (file) {
          await _this.uploadFiles(file['file'], s3UrlObj.url).then(
            () => {
              count++;
              if (count === data.length) {
                resolve(true);
              }
            }
          );
        } else {
          resolve(true);
        }
      }
    })
  }
  uploadFiles(file, url) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.consumerService.videoaudioS3Upload(url, file)
        .subscribe(() => {
          resolve(true);
        }, error => {
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          resolve(false);
        });
    })
  }
  isFormInvalid() {
    let invalid = false;
    if (this.editProfileForm.get('first_name').status !== 'VALID' || this.editProfileForm.get('last_name').status !== 'VALID'
      || this.editProfileForm.get('email').status !== 'VALID' || this.editProfileForm.get('email1').status !== 'VALID') {
      invalid = true;
    }
    if (this.editProfileForm.get('phoneNo').value) {
      let phoneObj = this.editProfileForm.get('phoneNo');
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
    if (this.editProfileForm.get('whatsappnumber').value) {
      let phoneObj = this.editProfileForm.get('whatsappnumber');
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
    if (this.editProfileForm.get('telegramnumber').value) {
      let phoneObj = this.editProfileForm.get('telegramnumber');
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
    return invalid;
  }
}

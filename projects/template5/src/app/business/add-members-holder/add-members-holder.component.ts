import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AccountService, ConsumerService, ErrorMessagingService, LocalStorageService, Messages, projectConstantsLocal, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-add-members-holder',
  templateUrl: './add-members-holder.component.html',
  styleUrls: ['./add-members-holder.component.scss']
})

export class AddMembersHolderComponent implements OnInit, OnDestroy {
  family_member_cap = Messages.FAMILY_MEMBER;
  cancel_btn_cap = Messages.CANCEL_BTN;
  save_btn_cap = Messages.SAVE_BTN;
  update_btn_cap = Messages.UPDATE_BTN;
  member_cap = Messages.MEMBER_CAPTION;
  api_error = null;
  api_success = null;
  member_list: any = [];
  disableButton = false;
  addmemberobj = { 'fname': '', 'title': '', 'lname': '', 'phone': '', 'gender': '', 'dob': '', 'whatsAppNum': {}, 'telegramNum': {}, 'email': '', 'address': '', countryCode: '' };
  private subs = new SubSink();
  constructor(
    public dialogRef: MatDialogRef<AddMembersHolderComponent>,
    public translate: TranslateService,
    private wordProcessor: WordProcessor,
    private errorService: ErrorMessagingService,
    private accountService: AccountService,
    private lStorageService: LocalStorageService,
    private consumerService: ConsumerService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
    if (data.type === 'edit') {
      this.addmemberobj.fname = data.member.firstName || '';
      this.addmemberobj.lname = data.member.lastName || '';
      this.addmemberobj.title = data.member.title || '';
      this.addmemberobj.phone = data.member.primaryMobileNo || '';
      this.addmemberobj.gender = data.member.gender || '';
      this.addmemberobj.dob = data.member.dob || '';
      if (data.member.whatsAppNum && data.member.whatsAppNum.countryCode && data.member.whatsAppNum.number) {
        const whatsup = {}
        if (data.member.whatsAppNum.countryCode.startsWith('+')) {
          whatsup["countryCode"] = data.member.whatsAppNum.countryCode
        } else {
          whatsup["countryCode"] = '+' + data.member.whatsAppNum.countryCode
        }
        whatsup["number"] = data.member.whatsAppNum.number
        this.addmemberobj['whatsAppNum'] = whatsup;
      }
      if (data.member.telegramNum && data.member.telegramNum.countryCode && data.member.telegramNum.number) {
        const telegram = {}
        if (data.member.telegramNum.countryCode.startsWith('+')) {
          telegram["countryCode"] = data.member.telegramNum.countryCode
        } else {
          telegram["countryCode"] = '+' + data.member.telegramNum.countryCode
        }
        telegram["number"] = data.member.telegramNum.number
        this.addmemberobj['telegramNum'] = telegram;
      }
    }
  }

  ngOnInit() {
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  handleReturnDetails(obj) {
    console.log(obj);
    this.resetApi();
    this.addmemberobj.fname = obj.fname || '';
    this.addmemberobj.lname = obj.lname || '';
    this.addmemberobj.title = obj.title || '';
    this.addmemberobj.phone = obj.phone || '';
    this.addmemberobj.gender = obj.gender || '';
    this.addmemberobj.dob = obj.dob || '';
    this.addmemberobj.countryCode = obj.countryCode || '';
    this.addmemberobj.address = obj.address || '';
    if (obj.whatsappnumber) {
      const whatsappObj = {};
      whatsappObj['countryCode'] = obj.countryCode_whtsap;
      whatsappObj['number'] = obj.whatsappnumber;
      this.addmemberobj.whatsAppNum = whatsappObj;
    }
    if (obj.telegramnumber) {
      const telegramObj = {};
      telegramObj['countryCode'] = obj.countryCode_telegram;
      telegramObj['number'] = obj.telegramnumber;
      this.addmemberobj.telegramNum = telegramObj;
    }
    this.addmemberobj.email = obj.email;
  }
  handleSaveMember() {
    console.log("22", this.addmemberobj);
    this.disableButton = true;
    this.resetApi();
    let derror = '';
    if (derror === '') {
      const post_data = {
        'firstName': this.addmemberobj.fname,
        'lastName': this.addmemberobj.lname,
        'title': this.addmemberobj.title
      };
      if (this.addmemberobj.phone !== '') {
        post_data['phoneNo'] = this.addmemberobj.phone;
        post_data['countryCode'] = this.addmemberobj.countryCode;
      }
      if (this.addmemberobj.gender !== '') {
        post_data['gender'] = this.addmemberobj.gender;
      }
      if (this.addmemberobj.dob !== '') {
        post_data['dob'] = this.addmemberobj.dob;
      }
      if (this.addmemberobj.whatsAppNum) {
        post_data['whatsAppNum'] = this.addmemberobj.whatsAppNum;
      }
      if (this.addmemberobj.telegramNum) {
        post_data['telegramNum'] = this.addmemberobj.telegramNum;
      }
      if (this.addmemberobj.email) {
        post_data['email'] = this.addmemberobj.email;
      }
      if (this.addmemberobj.address) {
        post_data['address'] = this.addmemberobj.address;
      }
      console.log(post_data);
      if (this.data.type === 'add') {
        this.subs.sink = this.consumerService.addMembers(post_data)
          .subscribe(() => {
            this.api_success = Messages.MEMBER_CREATED;
            setTimeout(() => {
              this.dialogRef.close('reloadlist');
            }, projectConstantsLocal.TIMEOUT_DELAY);
          }, error => {
            let errorObj = this.errorService.getApiError(error);
            this.api_error = this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies());
            this.disableButton = false;
          });
      } else if (this.data.type === 'edit') {
        post_data['id'] = this.data.member.id;
        post_data['parent'] = this.data.member.parent;
        this.subs.sink = this.consumerService.editMember(post_data).subscribe(() => {
          this.api_success = Messages.MEMBER_UPDATED;
          setTimeout(() => {
            this.dialogRef.close('reloadlist');
          }, projectConstantsLocal.TIMEOUT_DELAY);
        }, error => {
          let errorObj = this.errorService.getApiError(error);
          this.api_error = this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies());
          this.disableButton = false;
        }
        );
      }
    } else {
      this.api_error = derror;
      this.disableButton = false;
    }
  }
  resetApi() {
    this.api_error = null;
    this.api_success = null;
  }
}
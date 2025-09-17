import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConsumerService, ErrorMessagingService, Messages, SubscriptionService, ToastService, WordProcessor } from 'jconsumer-shared';

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
  member_list: any = [];
  disableButton = false;
  addmemberobj = { 'fname': '', 'title': '', 'lname': '', 'phone': '', 'gender': '', 'dob': '', 'whatsAppNum': {}, 'telegramNum': {}, 'email': '', 'address': '', countryCode: '' };
  consumerData: any;
  constructor(
    public dialogRef: MatDialogRef<AddMembersHolderComponent>,
    public translate: TranslateService,
    // private accountService: AccountService,
    private subscriptionService: SubscriptionService,
    private consumerService: ConsumerService,
    private toastService: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private errorService: ErrorMessagingService
  ) {
    console.log("member2", data);
    if (data.type === 'edit') {
      this.addmemberobj.fname = data.member.firstName || '';
      this.addmemberobj.title = data.member.title || '';
      this.addmemberobj.lname = data.member.lastName || '';
      this.addmemberobj.phone = data.member.phoneNo || '';
      this.addmemberobj.countryCode = data.member.countryCode || '';
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
    else {
      this.consumerData = data.consumerData;
      console.log('consumerData', this.consumerData)
    }
  }

  ngOnInit() {
    // this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
  }
  ngOnDestroy() {
    // this.subs.unsubscribe();
  }
  handleReturnDetails(obj) {
    console.log(obj);
    this.addmemberobj.fname = obj.fname || '';
    this.addmemberobj.title = obj.title || '';
    this.addmemberobj.lname = obj.lname || '';
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
    console.log(this.addmemberobj);
    this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    this.disableButton = true;
    let derror = '';
    if (derror === '') {
      const post_data = {
        'firstName': this.addmemberobj.fname,
        'title': this.addmemberobj.title,
        'lastName': this.addmemberobj.lname
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
      console.log("post_data", post_data);
      if (this.data.type === 'add') {
        this.consumerService.addMembers(post_data)
          .subscribe(() => {
            this.toastService.showSuccess(Messages.MEMBER_CREATED);
            // this.snackbarService.openSnackBar(Messages.MEMBER_CREATED, { 'panelClass': 'snackbarnormal' });
            this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
            this.dialogRef.close('reloadlist');
          }, error => {
            this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);
            this.disableButton = false;
          });
      } else if (this.data.type === 'edit') {
        post_data['id'] = this.data.member.id;
        post_data['parent'] = this.data.member.parent;
        this.consumerService.editMember(post_data).subscribe(() => {
          this.toastService.showSuccess(Messages.MEMBER_UPDATED);
          // this.snackbarService.openSnackBar(Messages.MEMBER_UPDATED, { 'panelClass': 'snackbarnormal' });
          this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
          this.dialogRef.close('reloadlist');
        }, error => {
          this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
          this.disableButton = false;
        }
        );
      }
    } else {
      this.toastService.showError(derror);
      // this.snackbarService.openSnackBar(derror, { 'panelClass': 'snackbarerror' });
      this.disableButton = false;
      this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
    }
  }
}
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { ErrorMessagingService } from 'jaldee-framework/error-messaging';
import { FormMessageDisplayService } from 'jaldee-framework/form-message';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { AccountService } from '../../services/account-service';
import { ConsumerService } from '../../services/consumer-service';

@Component({
  selector: 'app-consumer-rate-service-popup',
  templateUrl: './consumer-rate-service-popup.html',
  styleUrls: ['./consumer-rate-service-popup.scss']
})
export class ConsumerRateServicePopupComponent implements OnInit {
  api_error = null;
  api_success = null;
  message = null;
  rate_value: any = 0;
  waitlist = null;
  newrating = true;
  load_complete = false;
  type;
  rate_your_visit = Messages.RATE_YOU_VISIT;
  rate_cap = Messages.RATING_CAP;
  message_cap = Messages.MESSAGE_CAP;
  cancel_btn_cap = Messages.CANCEL_BTN;
  rate_btn_cap = Messages.RATE_BTN_CAP;
  uuid;
  constructor(
    public dialogRef: MatDialogRef<ConsumerRateServicePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fed_service: FormMessageDisplayService,
    private consumerService: ConsumerService,
    private errorService: ErrorMessagingService,
    private accountService: AccountService,
    private wordProcessor: WordProcessor
  ) {
    this.waitlist = data.detail;
    this.type = data.isFrom;
    if (this.type === 'checkin') {
      this.uuid = this.waitlist.ynwUuid;
    } else if (this.type === 'appointment') {
      this.uuid = this.waitlist.uid;
    }
    else if (this.type === 'order') {
      this.uuid = this.waitlist.uid;
    }
  }
  ngOnInit() {
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.getRateByUser();
  }
  getRateByUser() {
    let params;
    if (this.type === 'appointment') {
      params = {
        'account-eq': this.waitlist.providerAccount.id,
        'uId-eq': this.uuid
      };
    } else if (this.type === 'checkin') {
      params = {
        'account': this.waitlist.providerAccount.id,
        'uId-eq': this.uuid
      };
    } else {
      params = {
        'account-eq': this.waitlist.providerAccount.id,
        'uId-eq': this.uuid
      };
    }
    this.consumerService.getConsumerRateService(params, this.type)
      .subscribe(
        data => {
          if (data[0]) {
            if (data[0]['feedback'].length > 0) {
              this.message = data[0]['feedback'][(data[0]['feedback'].length - 1)]['comments'];
            } else {
              this.message = '';
            }
            this.rate_value = data[0]['stars'];
            this.newrating = false;
          }
          this.load_complete = true;
        },
        () => {
          this.load_complete = true;
        });
  }
  setRate() {
    this.resetApiErrors();
    const params = {
      account: this.waitlist.providerAccount.id
    };
    let post_data;
    if (this.type === 'order') {
      post_data = {
        'uId': this.uuid,
        'stars': this.rate_value,
        'feedback': this.message
      };
    } else {
      post_data = {
        'uuid': this.uuid,
        'stars': this.rate_value,
        'feedback': this.message
      };
    }
    if (this.newrating) {
      this.addRateService(params, post_data);
    } else {
      this.updateRateService(params, post_data);
    }
  }
  addRateService(params, post_data) {
    this.consumerService.postConsumerRateService(params, post_data, this.type)
      .subscribe(
        () => {
          this.wordProcessor.apiSuccessAutoHide(this, Messages.SERVICE_RATE_UPDATE);
          setTimeout(() => {
            this.dialogRef.close('reloadlist');
          }, projectConstantsLocal.TIMEOUT_DELAY);
        },
        error => {
          let errorObj = this.errorService.getApiError(error);
          this.wordProcessor.apiErrorAutoHide(this, errorObj);
        });
  }
  updateRateService(params, post_data) {
    this.consumerService.updateConsumerRateService(params, post_data, this.type)
      .subscribe(
        () => {
          this.wordProcessor.apiSuccessAutoHide(this, Messages.SERVICE_RATE_UPDATE);
          setTimeout(() => {
            this.dialogRef.close('reloadlist');
          }, projectConstantsLocal.TIMEOUT_DELAY);
        },
        error => {
          let errorObj = this.errorService.getApiError(error);
          this.wordProcessor.apiErrorAutoHide(this, errorObj);
        });
  }
  handleratingClick(val) {
    this.rate_value = val.selectedrating;
  }
  resetApiErrors() {
    this.api_error = null;
    this.api_success = null;
  }
  checkDisablebutton() {
    if (this.rate_value === 0) {
      return true;
    } else {
      return false;
    }
  }
}

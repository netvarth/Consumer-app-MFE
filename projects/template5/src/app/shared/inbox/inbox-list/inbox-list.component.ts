
import { interval as observableInterval, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InboxServices } from '../inbox.service';
import { DateTimeProcessor, GroupStorageService, Messages, projectConstantsLocal, WordProcessor } from 'jconsumer-shared';
import { AddInboxMessagesComponent } from '../../add-inbox-messages/add-inbox-messages.component';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-inbox-list',
  templateUrl: './inbox-list.component.html',
  styleUrls: ['./inbox-list.component.scss']
})
export class InboxListComponent implements OnInit, OnDestroy {
  provider_consumer_cap = Messages.PROVIDER_CONSUMER_CAP;
  message_cap = Messages.MESSAGE_CAP;
  date_time_cap = Messages.DATE_TIME_CAP;
  reply_cap = Messages.REPLY_CAP;
  close_cap = Messages.CLOSE_BTN;
  delete_msg_cap = Messages.DELETE_MSG_CAP;
  no_msg_exists_cap = Messages.NO_MSG_EXISTS_CAP;
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_TIME_FORMAT;
  selectedMsg = -1;
  user_id;
  shownomsgdiv = false;
  hide_reply_button = false;
  terminologies = null;
  usertype = null;
  loading = true;
  cronHandle: Subscription;
  refreshTime = projectConstantsLocal.INBOX_REFRESH_TIME;
  msgdialogRef;
  fileTooltip = Messages.FILE_TOOLTIP;
  tooltipcls = '';
  showImages: any = [];

  @Input() messages: any;
  @Input() fromsource: any;
  @Output() reloadApi = new EventEmitter<any>();

  constructor(private inbox_services: InboxServices,
    private dialog: MatDialog,
    public wordProcessor: WordProcessor,
    // private accountService: AccountService,
    private groupService: GroupStorageService,
    private dateTimeProcessor: DateTimeProcessor) { 
      console.log("Messages:",this.messages)
    }

  ngOnInit() {
    if (this.fromsource === 'provider_checkin_detail' ||
      this.fromsource === 'consumer_checkin_detail') {
      this.hide_reply_button = true;
    } else {
      this.hide_reply_button = false;
    }
    // this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.terminologies = this.wordProcessor.getTerminologies();

    const userDet = this.groupService.getitemFromGroupStorage('jld_scon');
    this.user_id = userDet.id;
    this.loading = false;

    this.cronHandle = observableInterval(this.refreshTime * 1000).subscribe(() => {
      this.reloadApi.emit();
    });

  }

  ngOnDestroy() {
    if (this.cronHandle) {
      this.cronHandle.unsubscribe();
    }
    if (this.msgdialogRef) {
      this.msgdialogRef.close();
    }
  }
  replyMessage(message) {
    const pass_ob = {};
    let name = null;
    let source =  'consumer-';
    if (message.waitlistId) {
      source = source + 'waitlist';
      pass_ob['uuid'] = 'h_' + message.waitlistId;
    } else {
      source = source + 'common';
    }

    if (this.usertype === 'consumer') {
      name = message.accountName || null;
    }

    pass_ob['source'] = source;
    // pass_ob['user_id'] = message['owner']['id'];
    pass_ob['user_id'] = message['accountId'];
    pass_ob['type'] = 'reply';
    pass_ob['terminologies'] = this.terminologies;
    pass_ob['name'] = name;
    pass_ob['typeOfMsg'] = 'single';

    this.msgdialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'loginmainclass', 'smallform'],
      disableClose: true,
      autoFocus: true,
      data: pass_ob,
    });

    this.msgdialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
        this.selectedMsg = -1;
        this.reloadApi.emit();
      }
    });
  }
  showMsg(indx, message) {
    this.selectedMsg = indx;
    if (!message.read && this.user_id !== message.owner.id) {
      this.readProviderMessages(message.owner.id, message.messageId, message.accountId);
    }
  }
  closeMsg() {
    this.selectedMsg = -1;
  }
  formatDateDisplayTZ(message) {
    return moment.tz(JSON.parse(message.timeStamp), message.timeZone.trim()).format('MMM DD, y hh:mm a (zz)');
  }
  formatDateDisplay(dateStr) {
    dateStr = JSON.parse(dateStr);
    // console.log("Inbox Time :",dateStr)
    let retdate = '';
    const pubDate = new Date(dateStr);
    const obtdate = new Date(pubDate.getFullYear() + '-' + this.dateTimeProcessor.addZero((pubDate.getMonth() + 1)) + '-' + this.dateTimeProcessor.addZero(pubDate.getDate()));
    const obtshowdate = this.dateTimeProcessor.addZero(pubDate.getDate()) + '/' + this.dateTimeProcessor.addZero((pubDate.getMonth() + 1)) + '/' + pubDate.getFullYear();
    const obtshowtime = this.dateTimeProcessor.addZero(pubDate.getHours()) + ':' + this.dateTimeProcessor.addZero(pubDate.getMinutes());

    const today = new Date();
    const todaydate = new Date(today.getFullYear() + '-' + this.dateTimeProcessor.addZero((today.getMonth() + 1)) + '-' + this.dateTimeProcessor.addZero(today.getDate()));

    if (obtdate.getTime() === todaydate.getTime()) {
      retdate = this.dateTimeProcessor.convert24HourtoAmPm(obtshowtime);

    } else {
      retdate = obtshowdate + ' ' + this.dateTimeProcessor.convert24HourtoAmPm(obtshowtime);
    }
    return retdate;
  }
  showImagesection(index) {
    (this.showImages[index]) ? this.showImages[index] = false : this.showImages[index] = true;
  }
  getThumbUrl(attachment) {
    if (attachment.s3path.indexOf('.pdf') !== -1) {
      return attachment.thumbPath;
    } else {
      return attachment.s3path;
    }
  }
  readProviderMessages(providerId, messageId, accountId) {
    this.inbox_services.readProviderMessages(providerId, messageId, accountId).subscribe(data => {
      this.reloadApi.emit();
    });
  }
}


import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { KeyValue, Location } from '@angular/common';
import { ViewChild } from '@angular/core';
import { interval as observableInterval, Subscription } from 'rxjs';
import { CommonService, ConsumerService, DateTimeProcessor, ErrorMessagingService, FileService, GroupStorageService, JGalleryService, projectConstantsLocal, SharedService, SubscriptionService, TimezoneConverter, ToastService } from 'jconsumer-shared';

@Component({
  selector: 'app-inbox-outer',
  templateUrl: './inbox-outer.component.html',
  styleUrls: ['./inbox-outer.component.css']
})
export class InboxOuterComponent implements OnInit {

  messages: any = [];
  userDet;
  groupedMsgs: any = [];
  selectedUserMessages: any = [];
  loading = false;
  message = '';
  selectedProvider = '';
  selectedProviderName = '';
  selectedMessage = {
    files: [],
    base64: [],
    caption: []
  };
  showChat = false;
  screenWidth;
  small_device_display = false;
  sendMessageCompleted = true;
  @ViewChild('scrollMe') scrollFrame: ElementRef;
  image_list_popup: any = [];
  image_list_popup_temp: any = [];
  imageAllowed = ['JPEG', 'JPG', 'PNG'];
  scrollDone = false;
  cronHandle: Subscription;
  refreshTime = projectConstantsLocal.INBOX_REFRESH_TIME;
  replyMsg;
  msgTypes = projectConstantsLocal.INBOX_MSG_TYPES;
  @ViewChildren('outmsgId') outmsgIds: QueryList<ElementRef>;
  @ViewChildren('inmsgId') inmsgId: QueryList<ElementRef>;
  customId: any;
  theme: any;
  account: any;
  accountId: any;
  api_loading = true;
  selectedFiles = {
    files: [], base64: [], caption: []
  };
  filesToUpload: any = [];
  attachments: any;
  userId: any;
  constructor(
    private commonService: CommonService,
    private groupService: GroupStorageService,
    private location: Location,
    private toastService: ToastService,
    private consumerService: ConsumerService,
    private dateTimeProcessor: DateTimeProcessor,
    private fileService: FileService,
    private sharedService: SharedService,
    private errorService: ErrorMessagingService,
    private timezoneConverter: TimezoneConverter,
    private galleryService: JGalleryService,
    private subscriptionService: SubscriptionService) {
    this.showChat = true;
  }
  ngOnInit() {
    this.onResize();
    this.account = this.sharedService.getAccountInfo();
    let accountConfig = this.sharedService.getAccountConfig();
    if (accountConfig && accountConfig['theme']) {
      this.theme = accountConfig['theme'];
    }
    let accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    console.log("aaccountProfile", accountProfile);
    this.accountId = accountProfile.id;
    console.log(" this.accountId ", this.accountId);
    this.selectedProvider = this.accountId;
    this.customId = accountProfile['customId'] ? accountProfile['customId'] : accountProfile['accEncUid'];
    console.log("this.customId", this.customId);
    this.loading = true;
    this.userDet = this.groupService.getitemFromGroupStorage('jld_scon');
    console.log("userrr det", this.userDet);
    this.userId = this.userDet.id;
    this.getInboxMessages();
    this.cronHandle = observableInterval(this.refreshTime * 500).subscribe(() => {
      this.getInboxMessages();
    });
  }
  ngOnDestroy() {
    if (this.cronHandle) {
      this.cronHandle.unsubscribe();
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 600) {
      this.small_device_display = true;
    } else {
      this.small_device_display = false;
    }
  }
  getInboxMessages() {
    this.consumerService.getInbox('consumer')
      .subscribe(
        data => {
          this.messages = data;
          this.scrollDone = true;
          this.sortMessages();
          this.groupedMsgs = this.commonService.groupBy(this.messages, 'accountId');
          console.log("Grouped Messages", this.groupedMsgs);
          if (this.selectedProvider !== '') {
            this.selectedUserMessages = (this.groupedMsgs[this.selectedProvider]) ? this.groupedMsgs[this.selectedProvider] : [];
            const unreadMsgs = this.selectedUserMessages.filter(msg => !msg.read && msg.owner.id !== this.userDet.id);
            if (unreadMsgs.length > 0) {
              const ids = unreadMsgs.map(msg => msg.messageId);
              const messageids = ids.toString();
              this.readProviderMessages(unreadMsgs[0].owner.id, messageids.split(',').join('-'), unreadMsgs[0].accountId);
            }
            setTimeout(() => {
              // this.scrollToElement();
            }, 100);
          }
          this.subscriptionService.sendMessage({ 'ttype': 'load_unread_count' });
          this.loading = false;
        },
        () => {
          this.loading = false;
        }
      );
  }
  goBack() {
    if (this.small_device_display && this.showChat && !this.accountId) {
      this.showChat = false;
    } else {
      this.location.back();
    }
  }
  sortMessages() {
    this.messages.sort(function (message1, message2) {
      if (message1.timeStamp > message2.timeStamp) {
        return 11;
      } else if (message1.timeStamp < message2.timeStamp) {
        return -1;
      } else {
        return 0;
      }
    });
  }
  valueOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return a.value[a.value.length - 1]['timeStamp'] > b.value[b.value.length - 1]['timeStamp'] ? -1 : b.value[b.value.length - 1]['timeStamp'] > a.value[a.value.length - 1]['timeStamp'] ? 1 : 0;
  }

  // Function to format the date with timezone abbreviation
  formatDateDisplayTZ(message: any): string {
    if (message) {
      return this.timezoneConverter.getZonedTime(message);
    }
    return '';
  }

  formatDateDisplay(dateStr) {
    dateStr = JSON.parse(dateStr);
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
  providerSelection(msgs) {
    this.clearImg();
    this.message = '';
    this.selectedProvider = msgs.key;
    this.selectedProviderName = msgs.value[(msgs.value.length - 1)].accountName;
    this.replyMsg = null;
    this.selectedUserMessages = msgs.value;
    if (this.small_device_display) {
      this.showChat = true;
    }
    const unreadMsgs = msgs.value.filter(msg => !msg.read && msg.owner.id !== this.userDet.id);
    if (unreadMsgs.length > 0) {
      const ids = unreadMsgs.map(msg => msg.messageId);
      const messageids = ids.toString();
      this.readProviderMessages(unreadMsgs[0].owner.id, messageids.split(',').join('-'), unreadMsgs[0].accountId);
    }
    setTimeout(() => {
      this.scrollToElement();
    }, 100);
  }
  getUnreadCount(messages) {
    const unreadMsgs = messages.filter(msg => !msg.read && msg.owner.id !== this.userDet.id);
    return unreadMsgs.length;
  }
  readProviderMessages(providerId, messageId, accountId) {
    this.consumerService.readProviderMessages(providerId, messageId, accountId).subscribe(data => {
      this.getInboxMessages();
    });
  }
  sendMessage() {
    if (this.message) {
      this.sendMessageCompleted = false;
      const post_data = {
        communicationMessage: this.message
      };
      const dataToSend: FormData = new FormData();
      let message = {}
      message['msg'] = post_data.communicationMessage;
      message['messageType'] = 'CHAT';
      if (this.replyMsg) {
        post_data['replyMessageId'] = this.replyMsg.messageId;
        if (this.replyMsg.messageType === 'ENQUIRY') {
          message['messageType'] = 'ENQUIRY';
        }
      }
      post_data['message'] = message;
      post_data['attachments'] = [];
      delete post_data['communicationMessage'];
      for (let i = 0; i < this.filesToUpload.length; i++) {
        this.filesToUpload[i]['order'] = i;
        if (this.filesToUpload[i]['type'] == 'photo') {
          post_data['attachments'].push(this.filesToUpload[i]);
        }
      }
      let filter;
      if (!this.selectedUserMessages[0]) {
        filter = { 'account': this.accountId };
      } else {
        filter = { 'account': this.selectedUserMessages[0].accountId };
      }
      this.consumerService.addConsumertoProviderNote(post_data, filter)
        .subscribe(
          () => {
            this.message = '';
            this.scrollDone = false;
            this.replyMsg = null;
            this.clearImg();
            this.sendMessageCompleted = true;
            this.selectedFiles = {
              files: [], base64: [], caption: []
            };
            setTimeout(() => {
              this.getInboxMessages();
            }, 500);
          }, error => {
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);
            this.sendMessageCompleted = true;
          }
        );
    }
  }
  clearImg() {
    this.selectedMessage = {
      files: [],
      base64: [],
      caption: []
    };
  }
  getUserName(messages) {
    let user = messages[(messages.length - 1)].accountName;
    if (user) {
      const userPattern = new RegExp(/^[ A-Za-z0-9_.'-]*$/);
      const name = user.split(' ');
      const pattern = userPattern.test(name[0]);
      let nameShort = name[0].charAt(0);
      if (name.length > 1 && pattern) {
        nameShort = nameShort + name[name.length - 1].charAt(0);
      }
      return nameShort.toUpperCase();
    }
  }
  // filesSelected(event) {
  //   const input = event.target.files;
  //   if (input) {
  //     for (const file of input) {
  //       if (projectConstantsLocal.FILETYPES_UPLOAD.indexOf(file.type) === -1) {
  //         this.snackbarService.openSnackBar('Selected image type not supported', { 'panelClass': 'snackbarerror' });
  //       } else if (file.size > projectConstantsLocal.FILE_MAX_SIZE) {
  //         this.snackbarService.openSnackBar('Please upload images with size < 10mb', { 'panelClass': 'snackbarerror' });
  //       } else {
  //         this.selectedMessage.files.push(file);
  //         const reader = new FileReader();
  //         reader.onload = (e) => {
  //           this.selectedMessage.base64.push(e.target['result']);
  //         };
  //         reader.readAsDataURL(file);
  //       }
  //     }
  //   }
  // }
  getImage(url, file) {
    return this.fileService.getImage(url, file);
  }
  showChatSection() {
    this.showChat = !this.showChat;
  }
  scrollToElement() {
    try {
      this.scrollFrame.nativeElement.scrollTop = this.scrollFrame.nativeElement.scrollHeight;
    } catch (err) { }
  }
  getThumbUrl(attachment) {
    if (attachment.s3path.indexOf('.pdf') !== -1) {
      return attachment.thumbPath;
    } else {
      return attachment.s3path;
    }
  }
  openImage(attachements, index) {
    this.image_list_popup_temp = this.image_list_popup = [];
    let count = 0;
    for (let comIndex = 0; comIndex < attachements.length; comIndex++) {
      const thumbPath = attachements[comIndex].thumbPath;
      let imagePath = thumbPath;
      const description = attachements[comIndex].s3path;
      if (this.checkImgType(description) === 'img') {
        imagePath = attachements[comIndex].s3path;
      } else {
        imagePath = attachements[comIndex].thumbPath;
      }
      let imgobj = {
        source: imagePath,
        thumb: imagePath,
        alt: (attachements[comIndex].caption) ? attachements[comIndex].caption : ''
      };
      this.image_list_popup_temp.push(imgobj);
      count++;
    }
    if (count > 0) {
      this.image_list_popup = this.image_list_popup_temp;
      setTimeout(() => {
        this.openGallery(this.image_list_popup[index]);
      }, 200);
    }
  }
  deleteTempImage(i) {
    this.selectedFiles.files.splice(i, 1);
    this.selectedFiles.base64.splice(i, 1);
    this.selectedFiles.caption.splice(i, 1);

    this.filesToUpload.splice(i, 1);

    // this.selectedMessage.files.splice(i, 1);
    // this.selectedMessage.base64.splice(i, 1);
    // this.selectedMessage.caption.splice(i, 1);
  }
  replytoMsg(msg) {
    this.replyMsg = msg;
  }
  closeReply() {
    this.replyMsg = null;
  }
  getReplyMsgbyId(msgId) {
    const replyMsg = this.messages.filter(msg => msg.messageId === msgId);
    return replyMsg[0];
  }
  // gotoReplyMsgSection(msgId) {
  //   let msgs;
  //   if (this.getReplyMsgbyId(msgId).owner.id !== this.userDet.id) {
  //     msgs = this.outmsgIds;
  //   } else {
  //     msgs = this.inmsgId;
  //   }
  //   msgs.toArray().forEach(element => {
  //     if (element.nativeElement.innerHTML.trim() === this.getReplyMsgbyId(msgId).msg.trim()) {
  //       const a = document.getElementsByClassName('selmsg');
  //       const b = document.getElementsByClassName('messages');
  //       for (let i = 0; i < a.length; i++) {
  //         if (a[i].innerHTML.trim() === this.getReplyMsgbyId(msgId).msg.trim()) {
  //           b[i].classList.add('blinkelem');
  //         }
  //       }
  //       element.nativeElement.scrollIntoViewIfNeeded();
  //       return false;
  //     }
  //   });
  //   setTimeout(() => {
  //     const b = document.getElementsByClassName('messages');
  //     for (let i = 0; i < b.length; i++) {
  //       b[i].classList.remove('blinkelem');
  //     }
  //   }, 2000);
  // }

  gotoReplyMsgSection(msgId: string): void {
    const targetMsg = this.getReplyMsgbyId(msgId).msg.trim();
    const isOwner = this.getReplyMsgbyId(msgId).owner.id === this.userDet.id;
    const msgs = isOwner ? this.inmsgId : this.outmsgIds;

    // Find the matching message
    for (const element of msgs.toArray()) {
      if (element.nativeElement.innerHTML.trim() === targetMsg) {
        this.highlightMessage(targetMsg);
        element.nativeElement.scrollIntoViewIfNeeded();
        break; // Exit the loop after finding the target
      }
    }

    // Remove highlight after 2 seconds
    setTimeout(() => this.clearHighlight(), 2000);
  }

  private highlightMessage(targetMsg: string): void {
    const selMsgElements = Array.from(document.getElementsByClassName('selmsg'));
    const messageElements = Array.from(document.getElementsByClassName('messages'));

    selMsgElements.forEach((selElement, index) => {
      if (selElement.innerHTML.trim() === targetMsg) {
        messageElements[index]?.classList.add('blinkelem');
      }
    });
  }
  private clearHighlight(): void {
    const messageElements = Array.from(document.getElementsByClassName('messages'));
    messageElements.forEach(element => element.classList.remove('blinkelem'));
  }

  getMsgType(msg) {
    if (msg.messageType) {
      return this.msgTypes[msg.messageType];
    }
  }
  checkImgType(img) {
    img = img.split('?');
    if (img[0] && img[0].indexOf('.pdf') === -1) {
      return 'img';
    } else {
      return 'pdf';
    }
  }


  filesSelected(event, type) {
    // console.log('selectUser', this.ownerID);
    // this.api_loading = true;
    // this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    let loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    const input = event.target.files;
    console.log("filesSelected input", input);
    let fileUploadtoS3 = [];
    if (input.length > 0) {
      const _this = this;
      this.api_loading = true;
      this.subscriptionService.sendMessage({ ttype: 'loading_start' });
      this.fileService.filesSelected(event, _this.selectedFiles).then(
        () => {
          let index = _this.filesToUpload && _this.filesToUpload.length > 0 ? _this.filesToUpload.length : 0;
          for (const pic of input) {
            const size = pic["size"] / 1024;
            let fileObj = {
              owner: loggedUser.id,
              ownerType: "ProviderConsumer",
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
          console.log("for _this.fileUpload", this.filesToUpload);
          console.log("for _this.fileUploadtoS3", fileUploadtoS3);
          _this.consumerService.uploadFilesToS3(fileUploadtoS3, this.accountId).subscribe(
            (s3Urls: any) => {
              if (s3Urls && s3Urls.length > 0) {
                _this.uploadAudioVideo(s3Urls).then(
                  (status) => {
                    if (status) {
                      this.api_loading = false;
                      _this.subscriptionService.sendMessage({ ttype: 'loading_stop' });

                    }
                  }
                );
              }
            }, error => {
              this.api_loading = false;
              _this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
              let errorObj = _this.errorService.getApiError(error);
              _this.toastService.showError(errorObj);
            }
          );
        }).catch((error) => {
          this.api_loading = false;
          this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
          let errorObj = _this.errorService.getApiError(error);
          _this.toastService.showError(errorObj);
        })
    }
  }
  uploadAudioVideo(data) {
    const _this = this;
    let count = 0;
    return new Promise(async function (resolve, reject) {
      for (const s3UrlObj of data) {
        console.log('_this.filesToUpload', _this.filesToUpload)
        let file = _this.filesToUpload.filter((fileObj) => {
          return ((fileObj.order === (s3UrlObj.orderId)) ? fileObj : '');
        })[0];
        console.log("File:", file);
        _this.attachments = file;
        if (file) {
          file['driveId'] = s3UrlObj.driveId;
          await _this.uploadFiles(file['file'], s3UrlObj.url, s3UrlObj.driveId).then(
            () => {
              count++;
              if (count === data.length) {
                resolve(true);
                console.log('_this.filesToUpload', _this.filesToUpload)
              }
            }
          );
        } else {
          resolve(true);
        }
      }
    })
  }
  uploadFiles(file, url, driveId) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.consumerService.videoaudioS3Upload(url, file)
        .subscribe(() => {
          console.log("Final Attchment Sending Attachment Success", file)
          _this.consumerService.videoaudioS3UploadStatusUpdate('COMPLETE', driveId, _this.accountId).subscribe((data: any) => {
            resolve(true);
          })
        }, error => {
          let errorObj = _this.errorService.getApiError(error);
          _this.toastService.showError(errorObj);
          resolve(false);
        });
    })
  }
  private getCurrentIndexCustomLayout(image, images): number {
    return image ? images.indexOf(image) : -1;
  }
  openGallery(image): void {
    let imageIndex = this.getCurrentIndexCustomLayout(image, this.image_list_popup);
    this.galleryService.open(this.image_list_popup, imageIndex);
  }
}

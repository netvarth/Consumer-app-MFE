import { Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AccountService, ConsumerService, ErrorMessagingService, FileService, GroupStorageService, LocalStorageService, Messages, projectConstantsLocal, SharedService, SubscriptionService, ToastService, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-add-inbox-messages',
  templateUrl: './add-inbox-messages.component.html',
  styleUrls: ['./add-inbox-messages.component.css']
})
export class AddInboxMessagesComponent implements OnInit, OnDestroy {
  amForm: UntypedFormGroup;
  api_error = null;
  api_success = null;
  cancel_btn_cap = Messages.CANCEL_BTN;
  send_btn_cap = Messages.SEND_BTN;
  user_id = null;
  uuid = null;
  message = '';
  smsGlobalStatusEnable;
  notificationStatusEnable;
  source = null;
  message_label = null;
  api_loading = true;
  terminologies = null;
  receiver_name = null;
  caption;
  disableButton = false;
  title = 'Send Message';
  selectedMessage = {
    files: [],
    base64: [],
    caption: []
  };
  showCaptionBox: any = {};
  activeImageCaption: any = [];
  sms = true;
  email = true;
  pushnotify = true;
  telegram = true;
  typeOfMsg;
  type;
  email_id: any;
  phone: any;
  SEND_MESSAGE = '';
  customer_label = '';
  phone_history: any;
  smsCredits: any;
  smsWarnMsg: string;
  is_smsLow = false;
  corpSettings: any;
  addondialogRef: any;
  is_noSMS = false;
  userId;
  jaldeeConsumer = true;
  isBusinessOwner;
  loginId;
  countryCode;
  countryCodeTele;
  chatId: any;
  IsTelegramDisable: any;
  countryCod;
  ynw_credentials;
  customers_label;
  grup_id;
  selectedcustomersformsg;
  selectedFiles = {
    files: [], base64: [], caption: []
  };
  @ViewChild('logofile') fileInput: ElementRef;
  filesToUpload: any = [];
  attachments: any;
  theme: any;
  constructor(
    public dialogRef: MatDialogRef<AddInboxMessagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public consumerService: ConsumerService,
    private errorService: ErrorMessagingService,
    private accountService: AccountService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private fileService: FileService,
    private wordProcessor: WordProcessor,
    private toastService: ToastService,
    private subscriptionService: SubscriptionService,
    private sharedService: SharedService
  ) {
    console.log("Add Info Data : ", this.data);

    // this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.typeOfMsg = this.data.typeOfMsg || null;
    this.user_id = this.data.user_id || null;
    this.userId = this.data.userId || null;
    this.uuid = this.data.uuid || null;
    this.email_id = this.data.email;
    this.phone = (this.data.phone) ? this.data.phone.trim() : '';
    this.countryCode = this.data.countryCode;
    this.phone_history = this.data.phone_history;
    this.source = this.data.source || null;
    this.receiver_name = this.data.name || null;
    this.terminologies = data.terminologies;
    this.theme = data.theme;
    if (data.grup_id) {
      this.grup_id = data.grup_id
    }
    if (data.selectedcustomersformsg) {
      this.selectedcustomersformsg = data.selectedcustomersformsg;
    }
    if (data.jaldeeConsumer) {
      this.jaldeeConsumer = (data.jaldeeConsumer === 'true') ? true : false;
    }
    if (this.typeOfMsg === 'single' && this.source !== 'donation-list') {
      if (!this.email_id) {
        this.email = false;
      }
      if ((!this.phone && !this.phone_history) || this.phone === '' || this.countryCode != '+91') {
        this.sms = false;
      }
      if ((!this.phone && !this.phone_history) || this.phone === '') {
        this.telegram = false;
      }
      if (!this.email_id && (!this.phone || (this.phone === '')) || !this.jaldeeConsumer) {
        this.pushnotify = false;
      }
    }
    if (this.source !== 'customer-list') {
      if (this.uuid && this.uuid.indexOf('appt') >= 0 || this.data.appt === 'appt') {
        this.type = 'appt';
      } else if (this.uuid && this.uuid.indexOf('order') >= 0 || this.data.order === 'order') {
        this.type = 'order';
      } else if (this.uuid && this.uuid.indexOf('odr') >= 0 || this.data.orders === 'orders') {
        this.type = 'orders';
      } else if (this.uuid && this.uuid.indexOf('appt') >= 0 || this.data.appt === 'order-provider') {
        this.type = 'order';
      } else if (this.uuid && this.uuid.indexOf('dtn') >= 0) {
        this.type = 'donation';
      } else {
        this.type = 'wl';
      }
    }
    if (this.data.caption) {
      this.caption = this.data.caption;
    } else {
      this.caption = 'Send Message';
    }
    this.title = (this.data.type === 'reply') ? 'Send Reply' : this.caption;
  }
  ngOnInit() {
    this.createForm();
    this.ynw_credentials = this.sharedService.getJson(this.lStorageService.getitemfromLocalStorage('ynw-credentials'));
    if (this.phone) {
      if (this.countryCode.startsWith('+')) {
        this.countryCod = this.countryCode.substring(1);
      }
    }
    this.SEND_MESSAGE = Messages.SEND_MESSAGE.replace('[customer]', this.customer_label);
  }
  ngOnDestroy() {
    // this.subs.unsubscribe();
  }
  setLabel() {
    let provider_label = this.receiver_name;
    let consumer_label = this.receiver_name;
    if (!provider_label) {
      provider_label = (this.terminologies && this.terminologies['provider']) ? this.terminologies['provider'] : 'provider';
    }
    if (!consumer_label || (consumer_label && consumer_label.trim() === '')) {
      consumer_label = (this.terminologies && this.terminologies['customer']) ? this.terminologies['customer'] : 'customer';
      if ((this.source === 'provider-waitlist' || this.source === 'provider-waitlist-inbox' || this.source === 'customer-list' || this.source === 'donation-list') && this.data.typeOfMsg && this.data.typeOfMsg === 'multiple' && this.data.uuid && this.data.uuid.length > 1) {
        consumer_label = consumer_label + 's';
      }
    }
    if (this.source === 'provider-sendAll') {
      consumer_label = (this.terminologies && this.terminologies['customer']) ? this.terminologies['customer'] : 'customer';
      this.customers_label = consumer_label + 's';
    }
    if (this.source === 'provider-sendAll_group') {
      consumer_label = (this.terminologies && this.terminologies['customer']) ? this.terminologies['customer'] : 'customer';
      this.customers_label = consumer_label + 's';
    }
    switch (this.source) {
      case 'consumer-waitlist': this.message_label = 'Message to ' + provider_label; break;
      case 'consumer-common': this.message_label = 'Message to ' + provider_label; break;
      case 'provider-common': this.message_label = 'Message to ' + consumer_label; break;
    }
  }
  createForm() {
    this.amForm = this.fb.group({
      message: ['', Validators.compose([Validators.required])]
    });
  }
  onSubmit(form_data) {
    console.log("Form Data :", form_data);
    this.resetApiErrors();
    const blankvalidate = projectConstantsLocal.VALIDATOR_BLANK;
    const foruuid = [];
    foruuid.push(this.uuid);
    if (blankvalidate.test(form_data.message)) {
      this.api_error = this.wordProcessor.getProjectMesssages('MSG_ERROR');
      this.disableButton = false;
    }
    const post_data = {
      communicationMessage: form_data.message
    };
    switch (this.source) {
      case 'consumer-waitlist': this.consumerToProviderWaitlistNote(post_data); break;
      case 'consumer-common': this.consumerToProviderNoteAdd(post_data); break;
    }
  }

  consumerToProviderWaitlistNote(post_data) {
    if (this.uuid !== null) {
      let message = {}
      //  post_data['provider'] = this.userId;
      message['msg'] = post_data.communicationMessage;
      message['messageType'] = 'BOOKINGS';
      const dataToSend: FormData = new FormData();
      post_data['message'] = message;
      post_data['attachments'] = [];
      delete post_data['communicationMessage'];

      // const captions = {};
      // let i = 0;

      for (let i = 0; i < this.filesToUpload.length; i++) {
        this.filesToUpload[i]['order'] = i;
        if (this.filesToUpload[i]['type'] == 'photo') {
          post_data['attachments'].push(this.filesToUpload[i]);
        }
      }
      if (this.type === 'appt') {
        this.consumerService.addConsumerAppointmentNote(this.user_id, this.uuid, post_data)
          .subscribe(
            () => {
              this.api_success = Messages.CONSUMERTOPROVIDER_NOTE_ADD;
              this.toastService.showSuccess(this.api_success);
              setTimeout(() => {
                this.dialogRef.close('reloadlist');
              }, projectConstantsLocal.TIMEOUT_DELAY);
            },
            error => {
              let errorObj = this.errorService.getApiError(error);
              this.wordProcessor.apiErrorAutoHide(this, errorObj);
            }
          );
      } else {
        this.consumerService.addConsumerWaitlistNote(this.user_id, this.uuid, post_data)
          .subscribe(
            () => {
              this.api_success = Messages.CONSUMERTOPROVIDER_NOTE_ADD;
              this.toastService.showSuccess(this.api_success);
              setTimeout(() => {
                this.dialogRef.close('reloadlist');
              }, projectConstantsLocal.TIMEOUT_DELAY);
            },
            error => {
              let errorObj = this.errorService.getApiError(error);
              this.wordProcessor.apiErrorAutoHide(this, errorObj);
            }
          );
      }
    }
  }

  consumerToProviderNoteAdd(post_data) {
    if (this.user_id) {
      let message = {}
      // post_data['provider'] = this.userId;
      message['msg'] = post_data.communicationMessage;
      message['messageType'] = 'ENQUIRY';
      post_data['message'] = message;
      post_data['attachments'] = [];
      delete post_data['communicationMessage'];
      for (let i = 0; i < this.filesToUpload.length; i++) {
        this.filesToUpload[i]['order'] = i;
        if (this.filesToUpload[i]['type'] == 'photo') {
          post_data['attachments'].push(this.filesToUpload[i]);
        }
      }
      const filter = {};
      filter['account'] = this.user_id;
      this.consumerService.addConsumertoProviderNote(post_data, filter)
        .subscribe(
          () => {
            this.api_success = Messages.CONSUMERTOPROVIDER_NOTE_ADD;
            console.log("Consumer Messages :", this.api_success);
            this.toastService.showSuccess(this.api_success);
            setTimeout(() => {
              this.dialogRef.close('reloadlist');
            }, projectConstantsLocal.TIMEOUT_DELAY);
          },
          error => {
            let errorObj = this.errorService.getApiError(error);
            this.wordProcessor.apiErrorAutoHide(this, errorObj);
          }
        );
    }
  }
  resetApiErrors() {
    this.api_error = null;
    this.api_success = null;
  }

  deleteTempImage(i, file) {
    this.selectedFiles.files.splice(i, 1);
    this.selectedFiles.base64.splice(i, 1);
    this.selectedFiles.caption.splice(i, 1);
    this.filesToUpload.splice(i, 1);
    this.fileInput.nativeElement.value = '';
    if (this.showCaptionBox && this.showCaptionBox[i]) {
      delete this.showCaptionBox[i];
      delete this.activeImageCaption[i];
    }
    let errorMsg: string = 'You have successfully removed' + ' ' + file['name'];
    this.toastService.showSuccess(errorMsg);
  }

  captionMenuClicked(index) {
    if (!this.activeImageCaption) {
      this.activeImageCaption = {};
      this.activeImageCaption[index] = '';
    }
    if (!this.showCaptionBox) {
      this.showCaptionBox = {};
    }
    this.showCaptionBox[index] = true;
  }
  closeCaptionMenu(index) {
    if (this.showCaptionBox && this.showCaptionBox[index]) {
      delete this.activeImageCaption[index];
      this.showCaptionBox[index] = false;
    }
  }
  keyPressed(event) {
    if (event.length === 160) {
      setTimeout(() => {
        this.api_error = '2 SMS credit will be used';
      }, 500);
    }
  }
  getFileType(type) {
    let cdnPath = this.sharedService.getCDNPath();
    if (type) {
      if (type === 'image/png' || type === '.png') {
        return (cdnPath + 'assets/images/ImgeFileIcon/png.png');
      }
      else if (type === 'application/pdf' || type === '.pdf') {
        return (cdnPath + 'assets/images/pdf.png');
      }
      else if (type === 'image/bmp' || type === '.bmp') {
        return (cdnPath + 'assets/images/ImgeFileIcon/bmp.png');
      }
      else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return (cdnPath + 'assets/images/ImgeFileIcon/docsWord.png');
      }
      else if (type === 'video/mp4') {
        return (cdnPath + 'assets/images/ImgeFileIcon/video.png');
      }
      else if (type === 'image/jpg' || type === '.jpg') {
        return (cdnPath + 'assets/images/ImgeFileIcon/jpg.png');
      }
      else if (type === 'image/jpeg') {
        return (cdnPath + 'assets/images/ImgeFileIcon/jpeg.png');
      }
      else {
        return (cdnPath + 'assets/images/ImgeFileIcon/othersFile.png');
      }
    }
    return (cdnPath + 'assets/images/ImgeFileIcon/othersFile.png');
  }
  getImageByType(type: any) {
    let cdnPath = this.sharedService.getCDNPath();
    if (type == 'pdf') {
      return (cdnPath + 'assets/images/pdf.png');
    } else if (type == 'vnd.ms-excel' || type == 'vnd.openxmlformats-officedocument.spreadsheetml.sheet' || type == 'xls' || type == 'xlsx') {
      return (cdnPath + 'assets/images/xls.png');
    } else if (type == 'mp3' || type == 'mpeg' || type == 'ogg') {
      return (cdnPath + 'assets/images/audio.png');
    } else if (type == 'mp4' || type == 'mpeg') {
      return (cdnPath + 'assets/images/video.png');
    } else if (type == 'application/msword' || type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || type == 'docx' || type == 'doc' || type == 'msword') {
      return (cdnPath + 'assets/images/ImgeFileIcon/wordDocsBgWhite.jpg');
    } else if (type == 'txt') {
      return (cdnPath + 'assets/images/ImgeFileIcon/docTxt.png');
    } else {
      return (cdnPath + 'assets/images/img_uplod.png');
    }
  }
  filesSelected(event, type) {
    let loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    const input = event.target.files;
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
          _this.consumerService.uploadFilesToS3(fileUploadtoS3, this.user_id).subscribe(
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
        let file = _this.filesToUpload.filter((fileObj) => {
          return ((fileObj.order === (s3UrlObj.orderId)) ? fileObj : '');
        })[0];
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
        }
        else {
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
          _this.consumerService.videoaudioS3UploadStatusUpdate('COMPLETE', driveId, _this.user_id).subscribe((data: any) => {
            resolve(true);
          })
        }, error => {
          console.log('error', error)
          let errorObj = _this.errorService.getApiError(error);
          _this.toastService.showError(errorObj);
          resolve(false);
        });
    })
  }
}

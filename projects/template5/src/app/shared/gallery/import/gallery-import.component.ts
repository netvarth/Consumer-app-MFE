import { Component, Inject, OnInit, EventEmitter, OnChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GalleryService } from '../galery-service';
import { Subscription } from 'rxjs';
import { ConsumerService, ErrorMessagingService, FileService, GroupStorageService, Messages, SubscriptionService, ToastService } from 'jconsumer-shared';

@Component({
  selector: 'app-gallery-import',
  templateUrl: './gallery-import.component.html',
  styleUrls: ['./gallery-import.component.scss']
})

export class GalleryImportComponent implements OnInit, OnChanges, OnDestroy {
  header_caption = 'Add files';
  select_image_cap = Messages.SELECT_IMAGE_CAP;
  delete_btn = Messages.DELETE_BTN;
  cancel_btn = Messages.CANCEL_BTN;
  performUpload = new EventEmitter<any>();
  img_exists = false;
  selectedFiles = {
    files: [], base64: [], caption: []
  };
  filesToUpload: any = [];
  selitem_pic = '';
  file_error_msg = '';
  api_error = null;
  api_success = null;
  api_loading = false;
  success_error = null;
  error_msg = '';
  error_list = [];
  img_save_caption = 'Save';
  savedisabled = false;
  canceldisabled = false;
  source_id;
  counter = null;
  subscription: Subscription;
  @ViewChild('filed') fileInput: ElementRef;
  accountId: any;
  uuid: any;
  type: any;
  attachments = false;
  attachmentInput: { medium: { email: boolean; sms: boolean; pushNotification: boolean; telegram: boolean; whatsApp: boolean; }; attachments: any; };
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<GalleryImportComponent>,
    public galleryService: GalleryService,
    private fileService: FileService,
    private groupService: GroupStorageService,
    private consumerService: ConsumerService,
    private toastService: ToastService,
    private subscriptionService: SubscriptionService,
    private errorService: ErrorMessagingService
  ) {
    if (this.data.accountId) {
      this.accountId = this.data.accountId;
    }
    if (this.data.uid) {
      this.uuid = this.data.uid;
    }
    if (this.data.type) {
      this.type = this.data.type;
    }
  }
  ngOnChanges() { }
  ngOnInit() {
    console.log("theme", this.data)
    if (this.data.source_id) {
      this.source_id = this.data.source_id;
      if (this.source_id === 'attachment' || this.source_id === 'consumerimages') {
        this.img_save_caption = 'send';
      }
    }
    else {
      this.dialogRef.close();
    }
    this.subscription = this.galleryService.getMessage().subscribe(
      (response) => {
        if (response.ttype === 'upload') {
          if (response.status === 'success') {
            this.dialogRef.close();
          } else {
            this.actionCompleted();
          }
        }
      }
    );
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  confirmDelete(file) {
    this.galleryService.confirmGalleryImageDelete(this, file);
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
            if (this.counter == null) {
              this.counter = 0;
            } else {
              this.counter = this.counter + 1;
            }
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
            fileObj['order'] = this.counter;
            _this.filesToUpload.push(fileObj);
            fileUploadtoS3.push(fileObj);
            index++;
          }
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
  deleteTempImage(i) {
    this.selectedFiles.files.splice(i, 1);
    this.selectedFiles.base64.splice(i, 1);
    this.selectedFiles.caption.splice(i, 1);
    this.filesToUpload.splice(i, 1);
    this.fileInput.nativeElement.value = '';
  }
  saveImages() {
    const saveAttachment_data = {
      medium: {
        email: false,
        sms: false,
        pushNotification: false,
        telegram: false,
        whatsApp: false
      },
      attachments: this.filesToUpload,

    };
    this.attachmentInput = saveAttachment_data;
    const input = {
      value: this.attachmentInput,
      accountId: this.accountId,
      uuid: this.uuid,
      type: this.type
    };
    this.galleryService.sendMessage(input);
  }
  actionCompleted() {
    this.savedisabled = false;
    this.img_save_caption = 'Save';
    this.canceldisabled = false;
  }
  getImage(url, file) {
    return this.fileService.getImage(url, file);
  }
}

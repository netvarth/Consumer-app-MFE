import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ConsumerService, ErrorMessagingService, FileService, GroupStorageService, OrderService, SharedService, ToastService, WordProcessor } from 'jconsumer-shared';
import { WishlistService } from '../../shared/wishlist.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy{
  @ViewChild('reviewFileInput') reviewFileInput?: ElementRef<HTMLInputElement>;
  orderUid: any;
  orderData: any = [];
  itemReviews: any[] = [];
  reviewedItemUids = new Set<string>();
  selectedItemReview: any = null;
  existingReviewMedia: { key: string; url: string; isVideo: boolean; fileName?: string; source: any; }[] = [];
  reviewEditMode = false;
  accountId: any;
  invoiceData: any = [];
  account: any;
  accountProfile: any;
  navIndex = 1;
  loading = false;
  config: any;
  theme: any;
  smallmobileDevice: boolean = false;
  shipmentUuid: any;
  shipmentDetail: any;
  statusLocationUrl: any;
  // status: { status: string; condition: boolean; }[];
  status:any;
  orderPlacedDate: any;
  shipmentTrackActivities: any;
  shipmentScheduled = false;
  shipmentPlaced = false;
  orderPickedup = false;
  orderDelivered = false;
  orderPickedupTime: any;
  shipmentScheduledTime: any;
  shipmentPlacedTime: any;
  orderDeliveredTime: any;
  estimatedTimeOfArrival: any;
  orderStatus: any;
  orderEstimatedDate:any;
  customer_label: any;
  cdnPath: string = '';
  showReviewPopup = false;
  selectedReviewItem: any = null;
  selectedRating = 0;
  reviewMessage = '';
  reviewStars = [1, 2, 3, 4, 5];
  reviewMediaPreviews: { file: File; fileName: string; url: string; isVideo: boolean; fileType: string; fileSize: number; }[] = [];
  loggedUser: any;
  providerConsumerId: any;
  reviewSubmitting = false;
  constructor(
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private router: Router,
    private toastService: ToastService,
    private location: Location,
    private wordProcessor: WordProcessor,
    private errorService: ErrorMessagingService,
    private wishlistService: WishlistService,
    private consumerService: ConsumerService,
    private fileService: FileService,
    private groupService: GroupStorageService
  ) { 
    this.cdnPath = this.sharedService.getCDNPath();
    this.onResize();
    this.activatedRoute.params.subscribe(params => {
      this.orderUid = params['id'];
    })
    this.activatedRoute.queryParams.subscribe(qParams => {
      // if(qParams && qParams['uuid']) {
      //   this.orderUid = qParams['uuid'];
      // }
      if(qParams && qParams['nav']) {
        this.navIndex = qParams['nav'];
      }
    })
    this.accountId = this.sharedService.getAccountID();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 768) {
      this.smallmobileDevice = true;
    }
  }

  ngOnInit(): void {
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.config = this.sharedService.getTemplateJSON();
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.providerConsumerId = this.loggedUser?.providerConsumer;
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    this.getOrderByUid() 
  }

  ngOnDestroy(): void {
    this.clearReviewMedia();
  }
  goBack() {
    this.location.back();
  }
  getOrderByUid() {
    this.loading = true;
    this.orderService.getOrderByUid(this.orderUid).subscribe(orderData =>{
      this.orderData = orderData; 
      this.orderPlacedDate = this.orderData.createdDate;
      this.loadItemReviews();
      this.loading = false;
      this.shipmentUuid = this.orderData.shipmentUuid;
      if(this.shipmentUuid){
        this.getEvents();
        this.shipmentDetails();
      }
    },
    error => {
      this.loading = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    })
  }

  loadItemReviews() {
    if (!this.orderData?.uid) {
      this.itemReviews = [];
      this.reviewedItemUids.clear();
      return;
    }
    const filter = {
      'orderUid-eq': this.orderData.uid
    };

    this.wishlistService.getItemReviews(filter).subscribe(
      (reviews: any) => {
        this.itemReviews = Array.isArray(reviews)
          ? reviews
          : Array.isArray(reviews?.items)
            ? reviews.items
            : [];
        this.reviewedItemUids = new Set(
          this.itemReviews
            .map((review) => review?.sorderItemUid)
            .filter((sorderItemUid) => !!sorderItemUid)
        );
      },
      error => {
        this.itemReviews = [];
        this.reviewedItemUids.clear();
        const errorObj = this.errorService.getApiError(error);
        this.toastService.showError(errorObj);
      }
    );
  }

  viewInvoice() {
    this.router.navigate([this.sharedService.getRouteID(), 'order', 'bill', this.orderData.uid]);

  } 

  getInvoiceByOrderUid() {
    return new Promise((resolve, reject) => {
      this.orderService.getInvoiceByOrderUid(this.accountId,this.orderUid).subscribe(
        data => {
          resolve(data);
        },
        error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
          reject(error)
        }
      )
    })

  }

  getAmountInDecimalPoints(amount) {
    return parseFloat(amount).toFixed(2);
  }

  gotoHome() {
    this.router.navigate([this.sharedService.getRouteID()])
  }

  setOrderStatus(original) {
    let modifiedStr = original.replace(/_/g, ' ');
    return modifiedStr
  }
  shipmentDetails(){
    this.shipmentUuid = this.orderData.shipmentUuid;
    console.log('orderData:2', this.shipmentUuid)
    return new Promise((resolve, reject) => {
      this.orderService.getShipmentDetails(this.orderUid).subscribe(
        data => {
          console.log('orderData:1',data)
          resolve(data);
          this.shipmentDetail = data;
          this.orderStatus = this.shipmentDetail.shipmentTrack[0].currentStatus;
          this.orderEstimatedDate = this.shipmentDetail.shipmentTrack[0].estimatedDeliveryDate;
          this.shipmentTrackActivities = this.shipmentDetail.shipmentTrackActivities;
          this.setShipmentTrackActivities();
        },
        error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
          reject(error)
        }
      )
    })
  }

  setShipmentTrackActivities() {

    for (let i = 0; i < this.shipmentTrackActivities.length; i++) {

      if (this.shipmentTrackActivities[i].activity == 'In Transit - Shipment picked up' || this.shipmentTrackActivities[i].activity == 'PickupDone' || this.shipmentTrackActivities[i].activity == 'PICKUPDONE') {
        this.orderPickedup = true;
        this.orderPickedupTime = this.shipmentTrackActivities[i].date;
      }

      if (this.shipmentTrackActivities[i].activity == 'Manifested - Pickup scheduled' || this.shipmentTrackActivities[i].activity == 'ReadyForReceive'  || this.shipmentTrackActivities[i].activity == 'READYFORRECEIVE') {
        this.shipmentScheduled = true;
        this.shipmentScheduledTime = this.shipmentTrackActivities[i].date;
      }

      if (this.shipmentTrackActivities[i].activity == 'Manifested - Consignment Manifested') {
        this.shipmentPlaced = true;
        this.shipmentPlacedTime = this.shipmentTrackActivities[i].date;
      }

      if (this.shipmentTrackActivities[i].activity == 'Deliverd'|| this.shipmentTrackActivities[i].activity == 'DELIVERD') {
        this.orderDelivered = true;
        this.orderDeliveredTime = this.shipmentTrackActivities[i].date;
      }
      this.getEvents();
    }
    this.estimatedTimeOfArrival = this.shipmentDetail.estimatedTimeOfArrival;
    this.statusLocationUrl = this.shipmentDetail.trackUrl;
    console.log('statusLocationUrl', this.statusLocationUrl)

  }

  
  getEvents() {
    this.status = [
      { date:this.orderPlacedDate ||'', status: 'Order Placed', condition: true },
      { date:this.shipmentPlacedTime ||'', status: 'Packaging', condition: this.shipmentScheduled },
      { date: this.orderPickedupTime ||'', status: 'On The Road', condition: this.orderPickedup},
      { date:this.orderDeliveredTime? this.orderDeliveredTime: this.orderEstimatedDate, status: 'Delivered', condition: this.orderDelivered}
    ]
  }
  getMarkerImage(event: any): string {
    if (event.condition) {
      return (this.cdnPath + 'assets/images/rx-order/items/success.svg');
    } else {
      return (this.cdnPath + 'assets/images/rx-order/items/pending.svg');
    }
  }

  getDate(dates) {
    const dateStr = dates;
    const date = new Date(dateStr);

    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // const formattedTime = date.toLocaleTimeString('en-US', {
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   hour12: true
    // });
    // const displaDate = `${formattedDate} at ${formattedTime.replace(':', '.')}`;

    const displaDate = `${formattedDate}`
    return displaDate;
  }

  isEmpty(obj: object) {
    return Object.keys(obj).length === 0;
  }

  hasItemReview(itemUid: string): boolean {
    return !!itemUid && this.reviewedItemUids.has(itemUid);
  }

  getItemReview(itemUid: string): any {
    if (!itemUid) {
      return null;
    }
    return this.itemReviews.find((review) => {
      const reviewItemUids = [
        review?.sorderItemUid,
        review?.itemUid,
        review?.sorderItem?.encId,
        review?.sorderItem?.uid
      ].filter((uid) => !!uid);
      return reviewItemUids.includes(itemUid);
    }) || null;
  }

  isReviewReadonly(): boolean {
    return !!this.selectedItemReview && !this.reviewEditMode;
  }

  openReviewPopup(item: any) {
    this.selectedReviewItem = item;
    this.selectedItemReview = this.getItemReview(item?.encId);
    this.reviewEditMode = !!this.selectedItemReview;
    this.showReviewPopup = true;
    this.selectedRating = this.selectedItemReview?.rating || 5;
    this.reviewMessage = this.selectedItemReview?.comments || '';
    this.reviewSubmitting = false;
    this.clearReviewMedia();
    this.existingReviewMedia = this.extractReviewMedia(this.selectedItemReview);
  }

  closeReviewPopup() {
    this.showReviewPopup = false;
    this.selectedReviewItem = null;
    this.selectedItemReview = null;
    this.reviewEditMode = false;
    this.selectedRating = 0;
    this.reviewMessage = '';
    this.reviewSubmitting = false;
    this.clearReviewMedia();
    this.existingReviewMedia = [];
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  enableReviewEdit() {
    if (!this.selectedItemReview) {
      return;
    }
    this.reviewEditMode = true;
  }

  openReviewFilePicker() {
    this.reviewFileInput?.nativeElement?.click();
  }

  updateReviewMessage(value: string) {
    if (this.isReviewReadonly()) {
      return;
    }
    this.reviewMessage = value || '';
  }

  onReviewFilesSelected(event: Event) {
    if (this.isReviewReadonly()) {
      return;
    }
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) {
      return;
    }
    const selectedFiles = {
      files: [],
      base64: []
    };

    this.fileService.filesSelected(event, selectedFiles).then(
      () => {
        Array.from(files).forEach((file: File) => {
          this.reviewMediaPreviews.push({
            file,
            fileName: file.name,
            url: URL.createObjectURL(file),
            isVideo: file.type.startsWith('video/'),
            fileType: file.type,
            fileSize: file.size
          });
        });
        input.value = '';
      }
    ).catch((error) => {
      this.toastService.showError(error);
      input.value = '';
    });
  }

  removeReviewMedia(index: number) {
    if (this.isReviewReadonly()) {
      return;
    }
    const media = this.reviewMediaPreviews[index];
    if (media?.url) {
      URL.revokeObjectURL(media.url);
    }
    this.reviewMediaPreviews.splice(index, 1);
  }

  removeExistingReviewMedia(index: number) {
    if (this.isReviewReadonly()) {
      return;
    }
    this.existingReviewMedia.splice(index, 1);
  }

  clearReviewMedia() {
    this.reviewMediaPreviews.forEach((media) => {
      if (media?.url) {
        URL.revokeObjectURL(media.url);
      }
    });
    this.reviewMediaPreviews = [];
  }

  submitReview() {
    if (this.reviewSubmitting) {
      return;
    }
    if (this.isReviewReadonly()) {
      return;
    }
    if (!this.orderData?.uid) {
      this.toastService.showError('Order details are not available');
      return;
    }
    if (!this.selectedReviewItem) {
      this.toastService.showError('Item details are not available');
      return;
    }
    if (!this.providerConsumerId) {
      this.toastService.showError('Provider consumer details are not available');
      return;
    }
    if (!Number.isInteger(this.selectedRating) || this.selectedRating < 1 || this.selectedRating > 5) {
      this.toastService.showError('Please select a rating between 1 and 5');
      return;
    }

    this.reviewSubmitting = true;
    this.uploadReviewMediaAndSubmit();
  }

  private uploadReviewMediaAndSubmit() {
    this.prepareReviewAttachments().then((attachments: any[]) => {
      const payload: any = {
        orderUid: this.orderData.uid,
        sorderItemUid: this.selectedReviewItem?.encId,
        providerConsumerId: this.providerConsumerId,
        rating: this.selectedRating,
        comments: this.reviewMessage?.trim() || ''
      };
      const existingMediaPayload = this.getExistingReviewMediaPayload();
      const newMediaPayload = attachments.map((attachment) => ({
        action: attachment.action,
        caption: attachment.caption,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        fileType: attachment.fileType,
        order: attachment.order,
        owner: attachment.owner,
        ownerType: attachment.ownerType,
        type: attachment.type,
        driveId: attachment.driveId
      }));
      const mergedMediaPayload = [...existingMediaPayload, ...newMediaPayload];

      if (mergedMediaPayload.length > 0) {
        payload.imgUpload = mergedMediaPayload;
        const videoAttachments = mergedMediaPayload.filter((attachment) => {
          const fileType = (attachment?.fileType || '').toString().toLowerCase();
          const type = (attachment?.type || '').toString().toLowerCase();
          return fileType === 'mp4' || type === 'video';
        });
        if (videoAttachments.length > 0) {
          payload.attachments = videoAttachments;
        }
      }

      const request$ = this.selectedItemReview?.uid
        ? this.wishlistService.updateFeedbackForItem(payload, this.selectedItemReview.uid)
        : this.wishlistService.addFeedbackForItem(payload);

      request$.subscribe(
        () => {
          this.toastService.showSuccess(this.selectedItemReview?.uid ? 'Review updated successfully' : 'Review submitted successfully');
          if (this.selectedReviewItem?.encId) {
            this.reviewedItemUids.add(this.selectedReviewItem.encId);
          }
          this.loadItemReviews();
          this.closeReviewPopup();
        },
        error => {
          this.reviewSubmitting = false;
          const errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
    }).catch((error) => {
      this.reviewSubmitting = false;
      this.toastService.showError(error || 'File upload failed');
    });
  }

  private prepareReviewAttachments(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.reviewMediaPreviews.length) {
        resolve([]);
        return;
      }

      const ownerId = this.loggedUser?.id;
      if (!ownerId) {
        reject('User details are not available');
        return;
      }

      const filesToUpload = this.reviewMediaPreviews.map((media, index) => ({
        owner: ownerId,
        ownerType: 'Provider',
        fileName: media.fileName,
        fileSize: media.fileSize / (1024 * 1024),
        caption: '',
        fileType: media.fileType.split('/')[1] || media.fileType,
        action: 'add',
        type: media.isVideo ? 'video' : 'photo',
        order: index,
        file: media.file
      }));

      this.consumerService.uploadFilesToS3(filesToUpload, this.accountId).subscribe(
        async (response: any) => {
          const s3Urls = Array.isArray(response) ? response : [];
          if (!s3Urls.length) {
            reject('File upload initialization failed');
            return;
          }
          try {
            const attachments = await this.uploadReviewFiles(filesToUpload, s3Urls);
            resolve(attachments);
          } catch (error) {
            reject(error);
          }
        },
        error => {
          const errorObj = this.errorService.getApiError(error);
          reject(errorObj);
        }
      );
    });
  }

  private uploadReviewFiles(filesToUpload: any[], s3Urls: any[]): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const attachments: any[] = [];

      for (const s3UrlObj of s3Urls) {
        const file = filesToUpload.find((fileObj) => fileObj.order === s3UrlObj.orderId);
        if (!file) {
          continue;
        }

        try {
          await this.uploadReviewFile(file.file, s3UrlObj.url, s3UrlObj.driveId);
          attachments.push({
            action: 'add',
            caption: 'feedback image',
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            order: file.order,
            owner: file.owner,
            ownerType: file.ownerType,
            type: file.type,
            driveId: s3UrlObj.driveId,
            file: file.file
          });
        } catch (error) {
          reject(error);
          return;
        }
      }

      resolve(attachments);
    });
  }

  private uploadReviewFile(file: File, url: string, driveId: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.consumerService.videoaudioS3Upload(url, file).subscribe(
        () => {
          this.consumerService.videoaudioS3UploadStatusUpdate('COMPLETE', driveId, this.accountId).subscribe(
            () => resolve(),
            error => {
              const errorObj = this.errorService.getApiError(error);
              reject(errorObj);
            }
          );
        },
        error => {
          const errorObj = this.errorService.getApiError(error);
          reject(errorObj);
        }
      );
    });
  }

  private extractReviewMedia(review: any): { key: string; url: string; isVideo: boolean; fileName?: string; source: any; }[] {
    if (!review) {
      return [];
    }

    const mediaSources = [
      ...(Array.isArray(review?.imgUpload) ? review.imgUpload : []),
      ...(Array.isArray(review?.attachments) ? review.attachments : [])
    ];

    const uniqueMedia = new Map<string, { key: string; url: string; isVideo: boolean; fileName?: string; source: any; }>();

    mediaSources.forEach((media) => {
      const url = media?.s3path || media?.url || media?.drive?.s3path || media?.drive?.url;
      if (!url) {
        return;
      }
      const fileType = (media?.fileType || media?.type || '').toString().toLowerCase();
      const key = media?.driveId || media?.id || media?.uuid || url;
      const mediaItem = {
        key,
        url,
        isVideo: fileType.includes('mp4') || fileType.includes('video'),
        fileName: media?.fileName,
        source: media
      };
      if (!uniqueMedia.has(key)) {
        uniqueMedia.set(key, mediaItem);
      }
    });

    return Array.from(uniqueMedia.values());
  }

  private getExistingReviewMediaPayload(): any[] {
    if (!this.selectedItemReview || !this.existingReviewMedia.length) {
      return [];
    }

    const uniqueMedia = new Map<string, any>();

    this.existingReviewMedia.forEach((mediaItem, index) => {
      const media = mediaItem?.source;
      const key = mediaItem?.key || media?.driveId || media?.id || media?.uuid || media?.s3path || media?.url || `${index}`;
      if (!uniqueMedia.has(key)) {
        uniqueMedia.set(key, {
          action: media?.action || 'add',
          caption: media?.caption || '',
          fileName: media?.fileName,
          fileSize: media?.fileSize,
          fileType: media?.fileType,
          order: media?.order ?? index,
          owner: media?.owner,
          ownerType: media?.ownerType,
          type: media?.type,
          driveId: media?.driveId
        });
      }
    });

    return Array.from(uniqueMedia.values());
  }

  getReviewActionLabel(): string {
    if (this.reviewSubmitting) {
      return this.selectedItemReview?.uid ? 'Updating...' : 'Submitting...';
    }
    return this.selectedItemReview?.uid ? 'Update Review' : 'Submit';
  }

}

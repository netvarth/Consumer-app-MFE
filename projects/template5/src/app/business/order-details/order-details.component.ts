import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { Location } from '@angular/common';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { OrderService } from '../../services/order.service';
import { AccountService } from '../../services/account-service';
import { OrderTemplatesComponent } from '../order-templates/order-templates.component';
import { DialogService } from 'primeng/dynamicdialog';
import { labOrderConstants } from '../../constants/lab-order.constants';
import { LocalStorageService } from 'jaldee-framework/storage/local';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  orderUid: any;
  orderData: any = [];
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
  redirectTo: string;
  customId: any;
  timelineStatusList: any = labOrderConstants.TIMELINE_STATUS;
  statusIndex: any;
  deliveryStatus: any;
  isPartnerLogin: any;
  deliveryDetails: any;
  events: any;
  constructor(
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private router: Router,
    private snackbarService: SnackbarService,
    private location: Location,
    private wordProcessor: WordProcessor,
    private dialogService: DialogService,
    private lStorageService: LocalStorageService
  ) { 
    this.onResize();
    this.activatedRoute.queryParams.subscribe(qParams => {
      if(qParams && qParams['uuid']) {
        this.orderUid = qParams['uuid'];
      }
      if(qParams && qParams['nav']) {
        this.navIndex = qParams['nav'];
      }
      if (qParams['back'] && qParams['back'] == 0) {
        this.redirectTo = 'home'; 
      }
    })
    if (this.lStorageService.getitemfromLocalStorage('partner')) {
      this.isPartnerLogin = this.lStorageService.getitemfromLocalStorage('partner')
    }
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.setTimeline();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 768) {
      this.smallmobileDevice = true;
    }
  }

  ngOnInit(): void {
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.config = this.accountService.getTemplateJson();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    this.getOrderByUid() 
  }
  goBack() {
    if (this.redirectTo && this.redirectTo === 'home') {
      this.providerDetail();
    } else {
      this.location.back();
    }
  }

  providerDetail() {
    this.router.navigate([this.customId, 'dashboard']);
  }
  getOrderByUid() {
    this.loading = true;
    this.orderService.getOrderByUid(this.orderUid).subscribe(orderData =>{
      this.orderData = orderData; 
      this.orderPlacedDate = this.orderData.createdDate;
      this.loading = false;
      this.shipmentUuid = this.orderData.shipmentUuid;
      if(this.shipmentUuid){
        this.getEvents();
        this.shipmentDetails();
      }
      if(this.isPartnerLogin && this.orderData?.uid && this.orderData?.deliveryAgentAssigned) {
        this.orderService.getDeliveryDetails(this.orderData?.uid).subscribe(data => {
          if(data) {
            this.deliveryDetails = data;
            this.deliveryDetails?.currentDeliveryStatus ? this.deliveryStatus = this.deliveryDetails.currentDeliveryStatus : '';
            console.log("this.deliveryDetails",this.deliveryDetails)
            this.deliveryStatus ? this.checkTimeline() : '';
            this.setTimeline();
          }
        })
      } 
    },
    error => {
      this.loading = false;
      this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
    })
  }

  viewInvoice() {
    let queryParams = {
      uuid: this.orderData.uid,
      accountId: this.accountId,
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.accountService.getCustomId(), 'order', 'order-bill'], navigationExtras);

  } 

  getInvoiceByOrderUid() {
    return new Promise((resolve, reject) => {
      this.orderService.getInvoiceByOrderUid(this.accountId,this.orderUid).subscribe(
        data => {
          resolve(data);
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          reject(error)
        }
      )
    })

  }

  gotoHome() {
    this.router.navigate([this.accountService.getCustomId()])
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
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
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

  setTimeline() {
    const defaultStatuses = [
      { deliveryStatus: 'assigned', updatedTime: '', isLast: false },
      { deliveryStatus: 'accepted', updatedTime: '', isLast: false },
      { deliveryStatus: 'pick_up', updatedTime: '', isLast: false },
      { deliveryStatus: 'in_transit', updatedTime: '', isLast: false },
      { deliveryStatus: 'delivered', updatedTime: '', isLast: true },
    ];

    if (this.deliveryDetails?.deliveryTrackingDetails?.length) {
      this.events = this.deliveryDetails.deliveryTrackingDetails.map((item, index) => ({
        deliveryStatus: item.deliveryStatus,
        updatedTime: item.updatedTime,
        isLast: index === this.deliveryDetails.deliveryTrackingDetails.length - 1,
      }));
      defaultStatuses.forEach((defaultStatus, index) => {
        const foundStatus = this.events.find((item) => item.deliveryStatus === defaultStatus.deliveryStatus);
        if (foundStatus) {
          defaultStatuses[index] = foundStatus;
        }
      });
    }
    this.events = defaultStatuses;
  }

  getMarkerImage(event) {
    switch (event.deliveryStatus) {
      case 'assigned':
        return event.updatedTime ? 'assets/images/rx-order/items/success.svg' : 'assets/images/rx-order/items/pending.svg';
      case 'accepted':
        return event.updatedTime ? 'assets/images/rx-order/items/success.svg' : 'assets/images/rx-order/items/pending.svg';
      case 'pick_up':
        return event.updatedTime ? 'assets/images/rx-order/items/success.svg' : 'assets/images/rx-order/items/pending.svg';
      case 'in_transit':
        return event.updatedTime ? 'assets/images/rx-order/items/success.svg' : 'assets/images/rx-order/items/pending.svg';
      case 'delivered':
        return event.updatedTime ? 'assets/images/rx-order/items/success.svg' : 'assets/images/rx-order/items/pending.svg';
      default:
        return 'assets/images/rx-order/items/pending.svg';
    }
  }

  getImageMarker(event: any): string {
    const completedStatuses = this.deliveryDetails?.deliveryTrackingDetails?.map(item => item.deliveryStatus) || [];
      if (completedStatuses.includes(event.name)) {
      return 'assets/images/order/check.png';
    }
      return 'assets/images/order/stopwatch.png';
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

  itemSchemaView(item) {
        let templateId = ''
        // const selectedItem = this.itemList.filter((items) => items.catalogItem.encId === item.catalogItem.encId);
        console.log('item1', item)
        let discountRef = this.dialogService.open(OrderTemplatesComponent, {
          header: 'Item Details',
          width: '100%',
          contentStyle: { overflow: 'auto' },
          baseZIndex: 10000,
          data: {
            templateData: item,
          },
        });
        discountRef.onClose.subscribe((result: any) => {
          if (result) {
    
          }
        });
    }

    getDateFromLogStatus(name) {
      let updatedTime = '';
      if (this.deliveryDetails?.deliveryTrackingDetails?.length > 0) {
        for (let i = 0; i < this.deliveryDetails.deliveryTrackingDetails.length; i++) {
          if (this.deliveryDetails.deliveryTrackingDetails[i].deliveryStatus == name) {
            updatedTime = this.deliveryDetails.deliveryTrackingDetails[i].updatedTime;
          }
        }
      }
      return updatedTime;
    }

    checkTimeline() {
      this.statusIndex = this.timelineStatusList.filter(
        (data) => data.name == this.deliveryStatus
      )[0].index;
      console.log('this.statusIndex', this.statusIndex);
    }
    
    isObjectNotEmpty(obj: any): boolean {
      return obj && Object.keys(obj).length > 0;
    }

}

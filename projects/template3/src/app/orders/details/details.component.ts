import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ErrorMessagingService, OrderService, SharedService, ToastService, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit{
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
  cdnPath: string = '';
  constructor(
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private router: Router,
    private toastService: ToastService,
    private location: Location,
    private wordProcessor: WordProcessor,
    private errorService: ErrorMessagingService
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
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    this.getOrderByUid() 
  }
  goBack() {
    this.location.back();
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
    },
    error => {
      this.loading = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    })
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

}

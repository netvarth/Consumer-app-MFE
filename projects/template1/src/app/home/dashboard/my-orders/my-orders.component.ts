import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationExtras, Router } from '@angular/router';
import { 
  AuthService, 
  ConsumerService, 
  ErrorMessagingService, 
  Messages, 
  OrderService, 
  SharedService, 
  SubscriptionService, 
  ToastService 
} from 'jconsumer-shared';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceListComponent } from '../../../shared/invoice-list/invoice-list.component';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  myOrders: any = [];
  limit = 2;
  orderLimit = 2;
  tDate: any;
  todayDate = new Date();
  accountId: any;
  activeUser: any;
  loggedIn: boolean = true;
  loading: boolean = false;
  orderTitles: any = [
    { id: 1, caption: 'today', displayName: "Today's Orders" },
    { id: 2, caption: 'future', displayName: 'Upcoming Orders' },
    { id: 3, caption: 'previous', displayName: 'Previous Orders', imgPath: '' }
  ]
  orderTitle: any;
  onlyVirtualItemsPresent = false;
  smallDevice: boolean;
  ratedialogRef;
  addnotedialogRef: any;
  send_msg_cap = Messages.SEND_MSG_CAP;
  invoiceDetailsById: any;
  allInvocies: any;
  selectedInoviceId: any;
  uuid: any;
  orderUuid: any;
  config: any;
  theme: any;
  cdnPath: string = '';
  constructor(
    private consumerService: ConsumerService,
    private authService: AuthService,
    private sharedService: SharedService,
    private router: Router,
    public translate: TranslateService,
    private toastService: ToastService,
    private subscriptionService: SubscriptionService,
    public dialog: MatDialog,
    private orderService: OrderService,
    private errorService: ErrorMessagingService,
    public translateService: TranslateService) {
    this.onResize();
    this.cdnPath = this.sharedService.getCDNPath();
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 767) {
      this.smallDevice = true;
    } else {
      this.smallDevice = false;
    }
  }
  ngOnInit(): void {
    this.accountId = this.sharedService.getAccountID();
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    this.authService.goThroughLogin().then((status) => {
      if (status) {
        this.initMyOrders();
      } else {
        this.loggedIn = false;
      }
    });
  }
  providerDetail() {
    this.router.navigate([this.sharedService.getRouteID()]);
  }
  initMyOrders() {
    this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    this.loading = true;
    let filters = {
      'accountId-eq': this.accountId,
      'orderStatus-eq': 'ORDER_CONFIRMED,ORDER_COMPLETED,ORDER_CANCELED'
    };
    this.orderService.getOrders(filters).subscribe((orders: any) => {
      this.myOrders = orders;
      this.loading = false;
      this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
    });
  }
  stopprop(event) {
    event.stopPropagation();
  }
  
  setOrderStatus(original) {
    let modifiedStr = original.replace(/_/g, ' ');
    return modifiedStr
  }
  getInvociesBybooking() {
    return new Promise((resolve, reject) => {
      this.consumerService.getInvoiceDetailsByuuid(this.orderUuid).subscribe(
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
  goToInvoiceList() {
    return new Promise((resolve, reject) => {
      this.addnotedialogRef = this.dialog.open(InvoiceListComponent, {
        width: '50%',
        panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
        disableClose: true,
        autoFocus: true,
        data: this.allInvocies
      });
      this.addnotedialogRef.afterClosed().subscribe(result => {
        resolve(result);
      });
    })
  }
  viewBill(order, event) {
    event.stopPropagation();
    if (order.invoiceCreated) {
      this.orderUuid = order.uid
      this.getInvociesBybooking().then((data: any) => {
        this.allInvocies = data;
        if (this.allInvocies && this.allInvocies.length === 1) {
          let queryParams = {           
            accountId: this.accountId,
            'paidStatus': false,
            invoiceInfo: order.invoiceCreated,
            invoiceId: this.allInvocies[0].invoiceUid
          }
          const navigationExtras: NavigationExtras = {
            queryParams: queryParams
          };
          this.router.navigate([this.sharedService.getRouteID(), 'order', 'bill', order.uid], navigationExtras);
        }
        else {
          this.goToInvoiceList().then((result: any) => {
            this.selectedInoviceId = result;
          if (this.selectedInoviceId) {
            let queryParams = {
              accountId: this.accountId,
              'paidStatus': false,
              invoiceInfo: order.invoiceCreated,
              invoiceId: this.selectedInoviceId
            }
            const navigationExtras: NavigationExtras = {
              queryParams: queryParams
            };
            this.router.navigate([this.sharedService.getRouteID(), 'order', 'bill', order.uid], navigationExtras);
          }
        });
        }
      })
    } else if (!order.invoiceCreated) {
      let queryParams = {
         accountId: this.accountId,
        'paidStatus': false,
        invoiceInfo: order.invoiceCreated,
      }
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.sharedService.getRouteID(), 'order', 'bill', order.uid], navigationExtras);
    }
  }
  goBack() {
    this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
  }
  
  showMore() {
    if (this.myOrders.length > this.limit) {
      this.orderLimit = this.myOrders.length;
    }
  }

  showLess() {
    if (this.myOrders.length > this.limit) {
      this.orderLimit = this.limit;
    }
  }
  showOrderDetails(order) {
    this.router.navigate([this.sharedService.getRouteID(), 'order', order.uid]);
    this.subscriptionService.sendMessage({ ttype: 'hideItemSearch', value: 0 });
  }

}

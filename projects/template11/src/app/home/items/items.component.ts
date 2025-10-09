import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FillQnrComponent } from '../fill-qnr/fill-qnr.component';
import { AuthService, ConsumerService, ErrorMessagingService, GroupStorageService, LocalStorageService, OrderService, SharedService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { MatDialog } from '@angular/material/dialog';
import { DeliverySelectionComponent } from './delivery-selection/delivery-selection.component';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss', './items_p.component.scss']
})
export class ItemsComponent implements OnInit {
  loggedIn: boolean = true;
  quantity: number = 1; // Initial quantity
  value: number = 50;
  sidebarVisible;
  checked1;
  checked2;
  items: any = [];
  account: any;
  accountId: any;
  storeEncId: any;
  loading: any = true;
  itemsLoading: boolean = false;
  cartId: any;
  orderList: any = [];
  itemsCount: number = 0;
  rows: number = 10; // Default number of items per page
  currentPage: number = 0;
  accountProfile: any;
  stores: any = [];
  showStores: boolean;
  itemCategories: any;
  activeIndex: number[];
  selectedCategories: any = [];
  showFilter = false;
  config: any;
  theme: any;
  loggedUser: any;
  isLoggedIn: boolean;
  selectedItem: any;
  isLogin: boolean;
  startIndex: number;
  questionnaireList: any;
  itemId: any;
  itemOptionsRef: DynamicDialogRef;
  questionAnswers: any;
  iteId: any;
  target: any;
  queryString: string;
  categoryNames: any = [];
  isSessionCart: any;
  deliveryType: any;
  itemTarget: any;
  pageEnabled: boolean = false;
  cdnPath: string = '';
  deliverydialogRef: any;
  itemDeliveryType: string;
  constructor(
    private router: Router,
    private location: Location,
    private sharedService: SharedService,
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private subscriptionService: SubscriptionService,
    private errorService: ErrorMessagingService,
    private consumerService: ConsumerService,
     private dialog: MatDialog,
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.accountId = this.sharedService.getAccountID();
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.activatedRoute.queryParams.subscribe(qParams => {
      this.selectedCategories = [];
      this.queryString = null;
      if (qParams['query']) {
        this.queryString = qParams['query'];
        this.selectedCategories = [];
        this.showFilter = false;
      } else if (qParams['categoryId']) {
        this.selectedCategories = qParams['categoryId'].split(',').map((id: string) => +id);
      }
      if(qParams['page']) {
        this.pageEnabled = true;
      }
      this.getStores().then((status) => {
        if (qParams['page'] && qParams['rows'] && status) {
          this.rows = qParams['rows'];
          this.currentPage = +qParams['page'];
        } else {
          this.currentPage = 0;
        }
        this.getSoCatalogItems();
      });   
    })
    this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
    if(this.lStorageService.getitemfromLocalStorage('itemTarget')) {
      this.itemTarget = this.lStorageService.getitemfromLocalStorage('itemTarget')
      this.scrollToElement(this.itemTarget);
    }
    this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart')
  }

  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    this.loading = true;
    this.activeIndex = [0, 1, 2]; // Open all panels by default, adjust based on the number of panels
  }

  goBack() {
    this.location.back();
  }

  getStores() {
    const filter = {
      'accountId-eq': this.accountId,
      'onlineOrder-eq': true,
      'status-eq': 'Active'
    };
  
    return new Promise((resolve, reject) => {
      this.orderService.getStores(filter).subscribe(
        (stores: any) => {
          this.stores = stores;
          this.lStorageService.setitemonLocalStorage('storeId', stores[0].id);
          switch (this.stores.length) {
            case 0:
              this.showStores = false;
              break;
            case 1:
              this.showStores = false;
              this.storeEncId = this.stores[0].encId;
              break;
            default:
              this.showStores = true;
              this.storeEncId = this.stores[0].encId;
              break;
          }
          if(!this.pageEnabled) {
            this.getSoCatalogItems();
          }
          this.getCategories();
          
          resolve(true); // Resolve with the stores data
        },
        (error) => {
          this.loading = false;
          this.itemsLoading = false;
          reject(error); // Reject the promise with the error
        }
      );
    });
  }

  getSoCatalogItems() {
    console.log("this.currentPage&rows",this.currentPage, this.rows)
    this.itemsLoading = true;
    this.startIndex = (this.currentPage * this.rows);
    let filter = {
      'accountId-eq': this.accountId,
      'storeEncId-eq': this.storeEncId,
      'from': this.currentPage * this.rows,
      'count': this.rows
    };
    console.log("Selected Categories:", this.selectedCategories);
    if (this.selectedCategories.length > 0) {
      filter['spItemCategoryId-eq'] = this.selectedCategories;
    }
    if (this.queryString) {
      filter['spItemName-like'] = this.queryString;
    }
    filter['parentItemId-eq'] = 0;
    this.orderService.getStoreCatalogItemsCount(filter).subscribe((count: any) => {
      this.itemsCount = count;
      this.orderService.getStoreCatalogItems(filter).subscribe((items) => {
        this.items = items;

      })
      this.itemsLoading = false;
      this.loading = false;
    }, () => {
      this.loading = false;
      this.itemsLoading = false;
    })
  }

  scrollToElement(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      console.log("element", element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        setTimeout(() => {
          const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
          const elementRect = element.getBoundingClientRect();
          const scrollPosition = currentScrollPosition + elementRect.top - 50;
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
          this.lStorageService.removeitemfromLocalStorage('itemTarget')
          this.itemTarget = [];
        }, 500);
      }
    }, 500);
  }
  scrollToElementById(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      console.log("element", element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        // setTimeout(() => {
          // const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
          // const elementRect = element.getBoundingClientRect();
          // const scrollPosition = currentScrollPosition + elementRect.top;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        // }, 500);
      }
    }, 500);
  }

  viewFilter() {
    this.sidebarVisible = true;
  }

  addToCart($event?, item?) {
    if (item && item.itemNature == "VIRTUAL_ITEM") {
      item.itemNature = "VIRTUAL_ITEM";
    } else {
      if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
      }
      const _this = this;
      if (item) {
        this.selectedItem = item;
      }
       this.itemDeliveryType = this.selectedItem?.homeDelivery ? 'HOME_DELIVERY' : 'STORE_PICKUP';
      if (this.selectedItem && (this.selectedItem.homeDelivery && this.selectedItem.storePickup)) {
       let dialogWidth = '500px'; // Set a constant width
        this.itemDeliveryType = 'HOME_DELIVERY';
        this.deliverydialogRef = this.dialogService.open(DeliverySelectionComponent, {
          header: 'Select Delivery Type',
          width: dialogWidth,
          contentStyle: { "max-height": "500px", "overflow": "auto" },
          baseZIndex: 10000,
          styleClass: 'custom-dialogs',
         data:{
            theme:this.theme
          }
        });

        this.deliverydialogRef.onClose.subscribe((result:any) => {
          if(result) {
         this.itemDeliveryType = result;
         this.proceedWithAddToCart(item)
          }
        });
       
      } else{
       this.proceedWithAddToCart(item);
      }
    }
  }
  proceedWithAddToCart(item){
       const _this = this;
       this.authService.goThroughLogin().then(
        (status) => {
          if (status) {
            _this.loggedIn = true;
            _this.loggedUser = _this.groupService.getitemFromGroupStorage('jld_scon');
            _this.isLogin = false;
            if (this.selectedItem && this.selectedItem.spItemDto && this.selectedItem.spItemDto.id) {
              this.iteId = this.selectedItem.spItemDto.id;
            }
            this.orderService.getQnrOrder(this.iteId).subscribe(
              (data: any) => {
                if (data) {
                  this.questionnaireList = data;
                  if (this.questionnaireList && this.questionnaireList.questionnaireId) {
                    this.itemOptionsRef = this.dialogService.open(FillQnrComponent, {
                      width: '90%',
                      contentStyle: { "max-height": "500px", "overflow": "auto" },
                      baseZIndex: 10000,
                      data: this.questionnaireList
                    });
                    this.itemOptionsRef.onClose.subscribe((result: any) => {
                      if (result !== undefined) {
                        this.questionAnswers = result
                        if (this.questionAnswers.answers.answerLine && this.questionAnswers.answers.answerLine.length > 0) {
                          this.lStorageService.setitemonLocalStorage('serviceOPtionInfo', this.questionAnswers);
                          _this.createCart(_this.selectedItem).then(data => {
                            _this.cartId = data;
                            _this.loggedIn = true;
                            _this.loading = false;
                            _this.isLogin = false;
                            _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                            _this.toastService.showSuccess("Item added to cart");
                            _this.setAnalytics();
                            // }
                          })
                        }
                      } else {
                        _this.createCart(_this.selectedItem).then(data => {
                          _this.cartId = data;
                          _this.loggedIn = true;
                          _this.loading = false;
                          _this.isLogin = false;
                          _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                          _this.toastService.showSuccess("Item added to cart");
                          _this.setAnalytics();
                        })
                      }
                    });
                  }
                  else {
                    _this.createCart(_this.selectedItem).then(data => {
                      _this.cartId = data;
                      _this.loggedIn = true;
                      _this.loading = false;
                      _this.isLogin = false;
                      _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                      if (data) {
                        _this.toastService.showSuccess("Item added to cart");
                        _this.setAnalytics();
                      }
                    })
                  }
                }
              }, (error) => {
                let errorObj = this.errorService.getApiError(error);
                this.toastService.showError(errorObj);
              });
          }
          else {
            if (!this.isSessionCart) {
              const cartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
            HOME_DELIVERY: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 },
            STORE_PICKUP: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 }
          };
          const deliveryType = this.itemDeliveryType == 'HOME_DELIVERY' ? 'HOME_DELIVERY' : 'STORE_PICKUP';
          const targetCart = cartData[deliveryType];
          const orderList = targetCart.items;

          const existingItem = orderList.find((orderItem: any) => orderItem.spItem.encId === item.spItem.encId);
          if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + this.quantity;
            existingItem.netTotal = existingItem.quantity * (existingItem.taxableAmount || 0);
            existingItem.totalTaxAmount = existingItem.quantity * (existingItem.taxAmount || 0);
            existingItem.netRate = existingItem.quantity * (existingItem.price || 0);
          } else {
            const newItem = {
              ...item,
              quantity: this.quantity,
              price: item.price || 0,
              netTotal: this.quantity * (item.taxableAmount || 0),
              totalTaxAmount: this.quantity * (item.taxAmount || 0),
              netRate: this.quantity * (item.price || 0)
            };
            orderList.push(newItem);
          }
          // Recalculate totals for the current delivery type
          targetCart.netTotal = orderList.reduce((total, i) => total + i.netTotal, 0);
          targetCart.taxTotal = orderList.reduce((total, i) => total + i.totalTaxAmount, 0);
          targetCart.netRate = orderList.reduce((total, i) => total + i.netRate, 0);

          this.lStorageService.setitemonLocalStorage('cartData', cartData);
          const totalItems = cartData.HOME_DELIVERY.items.length + cartData.STORE_PICKUP.items.length;
          this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: totalItems });
          this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });

          this.toastService.showSuccess("Item added to cart");
          this.setAnalytics();
          this.loggedIn = true;
          this.loading = false;
            } else {
              this.isLogin = true;
              this.loggedIn = false;
              this.loading = false;
            }
          }
        }
      )
  }

  capitalizeFirst(str) {
    return str
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
      .join(' ');
  }

  createCart(item) {
    let cartInfo = {}
    cartInfo['store'] = {
      'encId': this.storeEncId
    }
    cartInfo['providerConsumer'] = {
      'id': this.loggedUser.providerConsumer
    }
    cartInfo['deliveryType'] = this.itemDeliveryType == 'HOME_DELIVERY' ? 'HOME_DELIVERY' : 'STORE_PICKUP';
    cartInfo['items'] = [
      {
        'catalogItem': {
          'encId': item.encId
        },
        'quantity': this.quantity
      }
    ]
    cartInfo['orderCategory'] = 'SALES_ORDER';
    cartInfo['orderSource'] = 'PROVIDER_CONSUMER';
    return new Promise((resolve, reject) => {
      this.orderService.createCart(cartInfo).subscribe(
        (data) => {
          resolve(data);
        }, (error) => {
          resolve(false);
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
    });
  }

  actionPerformed(event) {
    this.loggedIn = true;
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.addToCart();
  }

  viewItems(item, target) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        itemEncid: item.encId
      }
    }
      this.lStorageService.setitemonLocalStorage('itemTarget', target);
      this.router.navigate([this.sharedService.getRouteID(), 'item', item.encId], navigationExtras);
  }

  viewAllItems() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {},
      queryParamsHandling: '' // Merge with existing query params
    });
  }

  getCategories() {
    this.orderService.getItemCategory(this.accountId).subscribe(
      (categories: any) => {
        this.itemCategories = categories;
        this.getSelectedCategories()
        if (this.itemCategories.length > 1 && !this.queryString) {
          this.showFilter = true;
        }
      }
    )
  }

  getSelectedCategories() {
    console.log("this.selectedCategories", this.selectedCategories)
    if (this.itemCategories && this.itemCategories.length > 0 && this.selectedCategories && this.selectedCategories.length > 0) {
      const filteredCategories = this.itemCategories.filter(category => this.selectedCategories.includes(category.id));
      this.categoryNames = filteredCategories.map(category => category.categoryName);
      console.log("this.categoryNames", this.categoryNames)
    } else if (this.selectedCategories.length == 0) {
      this.categoryNames = [];
    }
  }

  categorySelected(category, event) {
    console.log("Category Selected", category);
    this.itemsLoading = true;
    this.currentPage = 0;
    console.log("this.selectedCategories Before :", this.selectedCategories);
    if (this.selectedCategories.indexOf(category.id) == -1) {
      this.selectedCategories.push(category.id);
    } else {
      this.selectedCategories.splice(this.selectedCategories.indexOf(category.id), 1);
    }
    console.log("this.selectedCategories After :", this.selectedCategories);
    const queryParams = { ...this.activatedRoute.snapshot.queryParams, ['categoryId']: this.selectedCategories.join(',') };
    queryParams['page'] = this.currentPage;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: 'merge' // Merge with existing query params
    });
  }

  onPageChange(event) {
    this.currentPage = event.page;
    this.rows = event.rows;
    this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { page: this.currentPage, rows: this.rows },
        queryParamsHandling: 'merge'
    });
    this.getSoCatalogItems();
    setTimeout(() => {
      this.scrollToElementById('itemsContainer');
     }, 20);
  }
  setAnalytics() {
    let analytics = {
      accId: this.accountProfile.id,
      domId: this.accountProfile.serviceSector.id,
      subDomId: this.accountProfile.serviceSubSector.id,
      metricId: 550,
      storeId : this.lStorageService.getitemfromLocalStorage('storeId')
    }
    this.consumerService.updateAnalytics(analytics).subscribe();
  }
}

import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FillQnrComponent } from '../fill-qnr/fill-qnr.component';
import { AuthService, ConsumerService, ErrorMessagingService, GroupStorageService, LocalStorageService,  OrderService,  SharedService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { MatDialog } from '@angular/material/dialog';
import { DeliverySelectionComponent } from './delivery-selection/delivery-selection.component';
import { TeleBookingService } from '../../tele-bookings-service';
import { WishlistService } from '../../shared/wishlist.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss', './items_p.component.scss']
})
export class ItemsComponent implements OnInit, AfterViewInit, OnDestroy {
  loggedIn: boolean = true;
  quantity: number = 1; // Initial quantity
  value: number = 50;
  sidebarVisible;
  checked1;
  checked2;
  rangeValues: number[] = [200, 15300];
  items: any = [];
  account: any;
  accountId: any;
  storeEncId: any;
  loading: any = true;
  itemsLoading: boolean = false;
  cartId: any;
  orderList: any = [];
  itemsCount: number = 0;
  rows: number = 20; // Default number of items per page
  currentPage: number = 0;
  enableInfiniteScroll: boolean = true;
  hasMoreItems: boolean = true;
  private readonly mobileBreakpoint = 870;
  private readonly mobileRows = 20;
  private readonly desktopRows = 10;
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
  itemTypes: any = [];
  itemGroups: any = [];
  selectedTypes: any = [];
  typeNames: any = [];
  selectedGroups: any = [];
  groupNames: any = [];
  hidePrices: boolean = false;
  cartDisabled: boolean = false;
  appliedFilters: Array<{ type: 'category' | 'type' | 'group'; id: number; label: string }> = [];
  minPrice = 0;
  maxPrice = 20000;
  priceStep = 100;
  minPriceGap = 100;
  priceTrackStyle = '';
  private priceFilterTimer: any;
  private priceFilterTouched = false;
  sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Name: A-Z', value: 'a_z' },
    { label: 'Name: Z-A', value: 'z_a' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' }
  ];
  selectedSort = 'recommended';
  colors = ['red','orange','yellow','green','teal','blue','purple','pink','brown','black'];
  selectedColorIndex = -1;
  colorOptions = [
    { label: 'Olive', hex: '#5a6b3b' },
    { label: 'Maroon', hex: '#7a1f2b' },
    { label: 'Navy', hex: '#1d2b4a' },
    { label: 'Gold', hex: '#c9a24e' },
    { label: 'Teal', hex: '#2a6f6e' }
  ];
  discountOptions = [
    '10% and above',
    '20% and above',
    '30% and above',
    '40% and above',
    '50% and above'
  ];
  categoryLimit = 6;
  typeLimit = 6;
  groupLimit = 6;
  showAllCategories = false;
  showAllTypes = false;
  showAllGroups = false;
  private scrollObserver: IntersectionObserver | null = null;
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
      private teleBookingService: TeleBookingService,
      private wishlistService: WishlistService,
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.updateScrollMode(false);
    this.accountId = this.sharedService.getAccountID();
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    let accountConfig = this.sharedService.getAccountConfig();
    if (accountConfig) {
      this.cartDisabled = accountConfig['cartDisabled'] || false;
      this.hidePrices = accountConfig['hidePrice'] || false;
    }
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    if (!this.loggedUser?.providerConsumer) {
      this.wishlistService.clear();
    }
    this.activatedRoute.queryParams.subscribe(qParams => {
      this.selectedCategories = [];
      this.queryString = null;
      if (qParams['query']) {
        this.queryString = qParams['query'];
        this.selectedCategories = [];
        this.showFilter = false;
      } 
      if (qParams['categoryId']) {
        this.selectedCategories = qParams['categoryId'].split(',').map((id: string) => +id);
      } 
      if (qParams['typeId']) {
        this.selectedTypes = qParams['typeId'].split(',').map((id: string) => +id);
      }
      if (qParams['groupId']) {
        this.selectedGroups = qParams['groupId'].split(',').map((id: string) => +id);
      }
      if(qParams['page']) {
        this.pageEnabled = true;
      }
      this.getStores().then((status) => {
        if (!this.enableInfiniteScroll && qParams['page'] && qParams['rows'] && status) {
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

  @HostListener('window:resize')
  onResize() {
    this.updateScrollMode(true);
  }

  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    this.loading = true;
    this.activeIndex = [0, 1, 2];
    this.updatePriceTrack();
    this.loadWishlistState();
  }
  ngAfterViewInit(): void {
    this.initScrollObserver();
  }

  ngOnDestroy(): void {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
      this.scrollObserver = null;
    }
    if (this.priceFilterTimer) {
      clearTimeout(this.priceFilterTimer);
    }
  }

  private initScrollObserver(): void {
    const elements = Array.from(document.querySelectorAll('.reveal-item')) as Element[];
    if (!elements.length) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    if (!('IntersectionObserver' in window)) {
      this.revealAll(elements);
      return;
    }
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    elements.forEach((el) => el.classList.add('is-hidden'));
    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            entry.target.classList.remove('is-hidden');
            this.scrollObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -7% 0px' }
    );
    elements.forEach((el) => this.scrollObserver?.observe(el));
  }

  private revealAll(elements: Element[]): void {
    elements.forEach((el) => {
      el.classList.add('in-view');
      el.classList.remove('is-hidden');
    });
  }

  private updateScrollMode(reload: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }
    const isMobile = window.innerWidth < this.mobileBreakpoint;
    const nextEnable = isMobile;
    const nextRows = isMobile ? this.mobileRows : this.desktopRows;
    const modeChanged = nextEnable !== this.enableInfiniteScroll;
    this.enableInfiniteScroll = nextEnable;
    this.rows = nextRows;
    if (modeChanged) {
      this.currentPage = 0;
      if (reload) {
        this.getSoCatalogItems();
      }
    }
  }

  private updateHasMore(): void {
    this.hasMoreItems = this.items.length < this.itemsCount;
  }

  private resetItemsState(): void {
    this.items = [];
    this.hasMoreItems = true;
  }

  loadMoreItems(): void {
    if (!this.enableInfiniteScroll || this.itemsLoading || !this.hasMoreItems) {
      return;
    }
    this.currentPage += 1;
    this.getSoCatalogItems(true);
  }

  private loadWishlistState(): void {
    const providerConsumerId = this.loggedUser?.providerConsumer;
    if (!providerConsumerId) {
      return;
    }
    this.wishlistService.getallWishlistItems(providerConsumerId).subscribe(
      (wishlistItems: any) => {
        const list = this.extractWishlistItems(wishlistItems);
        list.forEach((wish) => {
          const itemEncId = wish?.catalogItem?.encId;
          if (!itemEncId) {
            return;
          }
          if (!this.wishlistService.isWishlisted(itemEncId)) {
            this.wishlistService.add({ encId: itemEncId });
          }
          if (wish?.id) {
            this.wishlistService.setWishlistItemUid(itemEncId, wish.id);
          }
          const spCode = wish?.spItem?.spCode;
          if (spCode) {
            this.wishlistService.setWishlistItemSpCode(itemEncId, spCode);
          }
        });
      },
      () => { }
    );
  }

  private processPendingWishlist(): void {
    const pending = this.lStorageService.getitemfromLocalStorage('pendingWishlistItem');
    if (!pending || !pending.encId) {
      return;
    }
    if (!this.loggedUser?.providerConsumer || !this.storeEncId) {
      return;
    }
    const wishlistItemEncId = pending.encId;
    if (this.wishlistService.isWishlisted(wishlistItemEncId)) {
      this.lStorageService.removeitemfromLocalStorage('pendingWishlistItem');
      return;
    }
    const payload = {
      store: {
        encId: this.storeEncId
      },
      providerConsumer: {
        id: this.loggedUser.providerConsumer
      },
      deliveryType: pending.deliveryType || this.deliveryType,
      items: [
        {
          catalogItem: {
            encId: wishlistItemEncId
          },
          quantity: 1
        }
      ],
      orderCategory: 'SALES_ORDER',
      orderSource: 'PROVIDER_CONSUMER'
    };
    this.lStorageService.removeitemfromLocalStorage('pendingWishlistItem');
    this.wishlistService.addToWishlist(payload).subscribe(
      (response: any) => {
        this.wishlistService.add({ encId: wishlistItemEncId });
        const wishlistUid = response?.id || response?.items?.[0]?.id;
        if (wishlistUid) {
          this.wishlistService.setWishlistItemUid(wishlistItemEncId, wishlistUid);
        }
        this.toastService.showSuccess('Added to wishlist');
      },
      (error) => {
        const errorObj = this.errorService.getApiError(error);
        const message = errorObj?.error || errorObj?.message || errorObj?.msg || '';
        if (typeof message === 'string' && message.toLowerCase().includes('already added to wishlist')) {
          this.wishlistService.add({ encId: wishlistItemEncId });
          return;
        }
        this.toastService.showError(errorObj);
      }
    );
  }

  private extractWishlistItems(wishlistItems: any): any[] {
    if (!Array.isArray(wishlistItems)) {
      return [];
    }
    const hasWrappedItems = wishlistItems.some((entry) => Array.isArray(entry?.items));
    if (hasWrappedItems) {
      return wishlistItems.reduce((acc: any[], entry: any) => {
        if (Array.isArray(entry?.items)) {
          acc.push(...entry.items);
        }
        return acc;
      }, []);
    }
    return wishlistItems;
  }

  isLowStock(item: any): boolean {
    return !!(item?.spItemDto?.lowStock || item?.lowStock || item?.spItemDto?.stockStatus === 'LOW');
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
          this.processPendingWishlist();
          this.getCategories();
          this.getItemGroup();
          this.getItemType();
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

  getSoCatalogItems(append: boolean = false) {
    console.log("this.currentPage&rows",this.currentPage, this.rows)
    if (this.priceFilterTouched) {
      this.applyPriceFilter(append);
      return;
    }
    const sort = this.getSortParams();
    if (Object.keys(sort).length) {
      this.applySortedFilter(sort, append);
      return;
    }
    this.itemsLoading = true;
    if (!append) {
      this.resetItemsState();
    }
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
    console.log("Selected Types:", this.selectedTypes);
    if (this.selectedTypes?.length > 0) {
      filter['spItemTypeId-eq'] = this.selectedTypes;
    }
    if (this.selectedGroups?.length > 0) {
      filter['itemGroups-eq'] = this.selectedGroups;
    }
    if (this.queryString) {
      filter['spItemName-like'] = this.queryString;
    }
    filter['parentItemId-eq'] = 0;
    const countCall = append ? null : this.orderService.getStoreCatalogItemsCount(filter);
    if (countCall) {
      countCall.subscribe(
        (count: any) => {
          this.itemsCount = count;
          this.orderService.getStoreCatalogItems(filter).subscribe(
            (items) => {
              const nextItems = Array.isArray(items) ? items : [];
              this.items = append ? [...this.items, ...nextItems] : nextItems;
              this.updateHasMore();
              setTimeout(() => {
                this.initScrollObserver();
              }, 0);
              this.itemsLoading = false;
              this.loading = false;
            },
            () => {
              this.itemsLoading = false;
              this.loading = false;
            }
          );
        },
        () => {
          this.loading = false;
          this.itemsLoading = false;
        }
      );
      return;
    }
    this.orderService.getStoreCatalogItems(filter).subscribe(
      (items) => {
        const nextItems = Array.isArray(items) ? items : [];
        this.items = append ? [...this.items, ...nextItems] : nextItems;
        this.updateHasMore();
        setTimeout(() => {
          this.initScrollObserver();
        }, 0);
        this.itemsLoading = false;
        this.loading = false;
      },
      () => {
        this.itemsLoading = false;
        this.loading = false;
      }
    );
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

  closeFilterSidebar() {
    this.sidebarVisible = false;
  }

  addToCart($event?, item?) {
    if (item && item.itemNature == "VIRTUAL_ITEM") {
      if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
      }
      this.viewItems(item, item.encId);
      return;
    }
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
                           // _this.setAnalytics();
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
                          //_this.setAnalytics();
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
                        //_this.setAnalytics();
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
         // this.setAnalytics();
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

  getItemType() {
    this.orderService.getItemType(this.accountId).subscribe(
      (itemTypes: any) => {
        this.itemTypes = itemTypes;
        console.log("this.itemTypes", this.itemTypes)
        this.getSelectedTypes();
        if (this.itemTypes.length > 1 && !this.queryString) {
          this.showFilter = true;
        }
      }
    )
  }

  getItemGroup() {
    this.orderService.getItemGroup(this.accountId).subscribe(
      (itemGroups: any) => {
        this.itemGroups = itemGroups;
        console.log("this.itemGroups", this.itemGroups)
        this.getSelectedGroups();
        if (this.itemGroups.length > 1 && !this.queryString) {
          this.showFilter = true;
        }
      }
    )
  }

  getSelectedTypes() {
    console.log("this.selectedTypes", this.selectedTypes)
    if (this.itemTypes?.length > 0 && this.selectedTypes?.length > 0) {
      const filteredTypes = this.itemTypes.filter(type => this.selectedTypes.includes(type.id));
      this.typeNames = filteredTypes.map(type => type.typeName);
      console.log("this.typeNames", this.typeNames)
    } else if (this.selectedTypes.length == 0) {
      this.typeNames = [];
    }
    this.buildAppliedFilters();
  }

  getSelectedGroups() {
    console.log("this.selectedGroups", this.selectedGroups)
    if (this.itemGroups?.length > 0 && this.selectedGroups?.length > 0) {
      const filteredGroups = this.itemGroups.filter(group => this.selectedGroups.includes(group.id));
      this.groupNames = filteredGroups.map(group => group.groupName);
      console.log("this.groupNames", this.groupNames)
    } else if (this.selectedGroups.length == 0) {
      this.groupNames = [];
    }
    this.buildAppliedFilters();
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
    this.buildAppliedFilters();
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
    this.getSelectedCategories();
  }

  typeSelected(type, event) {
    console.log("type Selected", type);
    this.currentPage = 0;
    this.itemsLoading = true;
    console.log("this.selectedTypes Before :", this.selectedTypes);
    if (this.selectedTypes.indexOf(type.id) == -1) {
      this.selectedTypes.push(type.id);
    } else {
      this.selectedTypes.splice(this.selectedTypes.indexOf(type.id), 1);
    }
    console.log("this.selectedTypes After :", this.selectedTypes);
    let queryParams = { ...this.activatedRoute.snapshot.queryParams, ['typeId']: this.selectedTypes.join(',') };
    queryParams['page'] = this.currentPage;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
    this.getSelectedTypes();
  }

  groupSelected(group, event) {
    console.log("group Selected", group);
    this.currentPage = 0;
    this.itemsLoading = true;
    console.log("this.selectedTypes Before :", this.selectedGroups);
    if (this.selectedGroups.indexOf(group.id) == -1) {
      this.selectedGroups.push(group.id);
    } else {
      this.selectedGroups.splice(this.selectedGroups.indexOf(group.id), 1);
    }
    console.log("this.selectedGroups After :", this.selectedGroups);
    let queryParams = { ...this.activatedRoute.snapshot.queryParams, ['groupId']: this.selectedGroups.join(',') };
    queryParams['page'] = this.currentPage;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
    this.getSelectedGroups();
  }

  onPageChange(event) {
    this.currentPage = event.page;
    this.rows = event.rows;
    this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { page: this.currentPage, rows: this.rows },
        queryParamsHandling: 'merge'
    });
    if (this.priceFilterTouched) {
      this.applyPriceFilter();
    } else {
      this.getSoCatalogItems();
    }
    setTimeout(() => {
      this.scrollToElementById('itemsContainer');
     }, 20);
  }

  get totalPages(): number {
    if (!this.itemsCount || !this.rows) {
      return 0;
    }
    return Math.max(1, Math.ceil(this.itemsCount / this.rows));
  }

  goToPage(page: number): void {
    const targetPage = Math.max(0, Math.min(page, this.totalPages - 1));
    if (targetPage === this.currentPage) {
      return;
    }
    this.currentPage = targetPage;
    this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { page: this.currentPage, rows: this.rows },
        queryParamsHandling: 'merge'
    });
    if (this.priceFilterTouched) {
      this.applyPriceFilter();
    } else {
      this.getSoCatalogItems();
    }
    setTimeout(() => {
      this.scrollToElementById('itemsContainer');
     }, 20);
  }

  getItemImage(item) {
    if (item && item.spItemDto && item.spItemDto.attachments && item.spItemDto.attachments.length && item.spItemDto.attachments[0].s3path) {
      return item.spItemDto.attachments[0].s3path;
    }
    return `${this.cdnPath}assets/images/rx-order/items/Items.svg`;
  }

  onClearAll() {
    this.selectedCategories = [];
    this.selectedTypes = [];
    this.selectedGroups = [];
    this.categoryNames = [];
    this.typeNames = [];
    this.groupNames = [];
    this.appliedFilters = [];
    this.currentPage = 0;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { categoryId: null, typeId: null, groupId: null, page: this.currentPage },
      queryParamsHandling: 'merge'
    });
  }

  onWishlist(item, event) {
    if (event) {
      event.stopPropagation();
    }
    const wishlistItemEncId = this.getWishlistItemEncId(item);
    const wishlistItemSpCode = this.getWishlistItemSpCode(item);
    if (!wishlistItemEncId) {
      return;
    }
    if (this.isWishlisted(item)) {
      const providerConsumerId = this.loggedUser?.providerConsumer;
      const delete$ = wishlistItemSpCode
        ? this.wishlistService.deleteWishlistItemBySpCode(wishlistItemSpCode)
        : this.wishlistService.deleteWishlistItemByItemEncId(wishlistItemEncId, providerConsumerId);
      delete$.subscribe(
        () => {
          this.wishlistService.removeFromWishlist(wishlistItemEncId);
          this.toastService.showSuccess('Removed from wishlist');
        },
        (error) => {
          const errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
      return;
    }
    if (!this.loggedUser?.providerConsumer) {
      const target = this.router.url || (this.sharedService.getRouteID() + '/items');
      this.lStorageService.setitemonLocalStorage('target', target);
      this.lStorageService.setitemonLocalStorage('pendingWishlistItem', {
        encId: wishlistItemEncId,
        deliveryType: this.resolveWishlistDeliveryType(item)
      });
      this.router.navigate([this.sharedService.getRouteID(), 'login']);
      return;
    }

    const proceed = () => {
      const providerConsumerId = this.loggedUser?.providerConsumer;
      if (!providerConsumerId || !this.storeEncId) {
        return;
      }
      const payload = {
        store: {
          encId: this.storeEncId
        },
        providerConsumer: {
          id: providerConsumerId
        },
        deliveryType: this.resolveWishlistDeliveryType(item),
        items: [
          {
            catalogItem: {
              encId: wishlistItemEncId
            },
            quantity: 1
          }
        ],
        orderCategory: 'SALES_ORDER',
        orderSource: 'PROVIDER_CONSUMER'
      };
      this.wishlistService.addToWishlist(payload).subscribe(
        (response: any) => {
          this.wishlistService.add({ encId: wishlistItemEncId });
          const wishlistUid =
            response?.id ||
            response?.items?.[0]?.id;
          if (wishlistUid) {
            this.wishlistService.setWishlistItemUid(wishlistItemEncId, wishlistUid);
          }
          this.toastService.showSuccess('Added to wishlist');
        },
        (error) => {
          const errorObj = this.errorService.getApiError(error);
          const message = errorObj?.error || errorObj?.message || errorObj?.msg || '';
          if (typeof message === 'string' && message.toLowerCase().includes('already added to wishlist')) {
            this.wishlistService.add({ encId: wishlistItemEncId });
            return;
          }
          this.toastService.showError(errorObj);
        }
      );
    };

    if (!this.loggedUser?.providerConsumer) {
      this.authService.goThroughLogin().then((status) => {
        if (status) {
          this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
          proceed();
        }
      });
      return;
    }
    proceed();
  }

  isWishlisted(item): boolean {
    return this.wishlistService.isWishlisted(this.getWishlistItemEncId(item));
  }

  trackByItem(index, item) {
    return item?.encId || item?.spItemDto?.id || index;
  }

  private getWishlistItemEncId(item: any): string | undefined {
    return item?.encId || item?.catalogItem?.encId || item?.spItemDto?.encId || item?.spItem?.encId;
  }

  private getWishlistItemSpCode(item: any): string | undefined {
    return item?.spItem?.spCode || item?.spItemDto?.spCode || item?.spCode;
  }

  private resolveWishlistDeliveryType(item: any): 'HOME_DELIVERY' | 'STORE_PICKUP' {
    const homeDelivery =
      item?.homeDelivery ??
      item?.spItemDto?.homeDelivery ??
      item?.spItem?.homeDelivery ??
      item?.catalogItem?.homeDelivery ??
      item?.catalogItem?.spItemDto?.homeDelivery;
    return homeDelivery ? 'HOME_DELIVERY' : 'STORE_PICKUP';
  }

  onMinPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    const maxAllowed = this.rangeValues[1] - this.minPriceGap;
    this.rangeValues[0] = Math.min(value, maxAllowed);
    input.value = String(this.rangeValues[0]);
    this.updatePriceTrack();
    this.schedulePriceFilter();
  }

  onMaxPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    const minAllowed = this.rangeValues[0] + this.minPriceGap;
    this.rangeValues[1] = Math.max(value, minAllowed);
    input.value = String(this.rangeValues[1]);
    this.updatePriceTrack();
    this.schedulePriceFilter();
  }

  private updatePriceTrack(): void {
    const min = this.minPrice;
    const max = this.maxPrice;
    const lowBound = Math.max(min, Math.min(this.rangeValues[0], max - this.minPriceGap));
    const highBound = Math.max(min + this.minPriceGap, Math.min(this.rangeValues[1], max));
    if (lowBound !== this.rangeValues[0]) {
      this.rangeValues[0] = lowBound;
    }
    if (highBound !== this.rangeValues[1]) {
      this.rangeValues[1] = highBound;
    }
    const low = this.rangeValues[0];
    const high = this.rangeValues[1];
    const lowPercent = ((low - min) / (max - min)) * 100;
    const highPercent = ((high - min) / (max - min)) * 100;
    this.priceTrackStyle = `linear-gradient(90deg, #e7d5c0 ${lowPercent}%, #a36a39 ${lowPercent}%, #a36a39 ${highPercent}%, #e7d5c0 ${highPercent}%)`;
  }

  private schedulePriceFilter(): void {
    this.priceFilterTouched = true;
    if (this.priceFilterTimer) {
      clearTimeout(this.priceFilterTimer);
    }
    this.priceFilterTimer = setTimeout(() => {
      this.currentPage = 0;
      this.applyPriceFilter();
    }, 600);
  }

  private applyPriceFilter(append: boolean = false): void {
    if (!this.accountId || !this.storeEncId) {
      return;
    }
    this.itemsLoading = true;
    if (!append) {
      this.resetItemsState();
    }
    const from = this.currentPage * this.rows;
    const filters = this.getFilterParams();
    const sort = this.getSortParams();
    const countFilter: any = {
      'accountId-eq': this.accountId,
      'storeEncId-eq': this.storeEncId,
      'parentItemId-eq': 0,
      'price-gt': this.rangeValues[0],
      'price-lt': this.rangeValues[1],
      ...filters
    };
    const countCall = append ? null : this.orderService.getStoreCatalogItemsCount(countFilter);
    const fetch = () => {
      this.teleBookingService.getCatalogItemsByPrice(
        this.accountId,
        this.storeEncId,
        from,
        this.rows,
        this.rangeValues[0],
        this.rangeValues[1],
        0,
        filters,
        sort
      ).subscribe(
        (items: any) => {
          const nextItems = Array.isArray(items) ? items : [];
          this.items = append ? [...this.items, ...nextItems] : nextItems;
          this.updateHasMore();
          setTimeout(() => {
            this.initScrollObserver();
          }, 0);
          this.itemsLoading = false;
          this.loading = false;
        },
        () => {
          this.itemsLoading = false;
          this.loading = false;
        }
      );
    };
    if (countCall) {
      countCall.subscribe(
        (count: any) => {
          this.itemsCount = count;
          fetch();
        },
        () => {
          this.itemsLoading = false;
          this.loading = false;
        }
      );
      return;
    }
    fetch();
  }

  goHome() {
    this.router.navigate([this.sharedService.getRouteID()]);
  }

  onSortChange(nextSort: string): void {
    this.selectedSort = nextSort;
    this.currentPage = 0;
    if (this.priceFilterTouched) {
      this.applyPriceFilter();
      return;
    }
    const sort = this.getSortParams();
    if (Object.keys(sort).length) {
      this.applySortedFilter(sort);
      return;
    }
    this.getSoCatalogItems();
  }

  private applySortedFilter(sort: any, append: boolean = false): void {
    if (!this.accountId || !this.storeEncId) {
      return;
    }
    if (!Object.keys(sort).length) {
      return;
    }
    this.itemsLoading = true;
    if (!append) {
      this.resetItemsState();
    }
    const from = this.currentPage * this.rows;
    const filters = this.getFilterParams();
    const countFilter: any = {
      'accountId-eq': this.accountId,
      'storeEncId-eq': this.storeEncId,
      'parentItemId-eq': 0,
      ...filters
    };
    const countCall = append ? null : this.orderService.getStoreCatalogItemsCount(countFilter);
    const fetch = () => {
      this.teleBookingService.getCatalogItemsWithSort(
        this.accountId,
        this.storeEncId,
        from,
        this.rows,
        0,
        filters,
        sort
      ).subscribe(
        (items: any) => {
          const nextItems = Array.isArray(items) ? items : [];
          this.items = append ? [...this.items, ...nextItems] : nextItems;
          this.updateHasMore();
          setTimeout(() => {
            this.initScrollObserver();
          }, 0);
          this.itemsLoading = false;
          this.loading = false;
        },
        () => {
          this.itemsLoading = false;
          this.loading = false;
        }
      );
    };
    if (countCall) {
      countCall.subscribe(
        (count: any) => {
          this.itemsCount = count;
          fetch();
        },
        () => {
          this.itemsLoading = false;
          this.loading = false;
        }
      );
      return;
    }
    fetch();
  }

  private getFilterParams(): any {
    const filters: any = {};
    if (this.selectedCategories?.length) {
      filters['spItemCategoryId-eq'] = this.selectedCategories;
    }
    if (this.selectedTypes?.length) {
      filters['spItemTypeId-eq'] = this.selectedTypes;
    }
    if (this.selectedGroups?.length) {
      filters['itemGroups-eq'] = this.selectedGroups;
    }
    if (this.queryString) {
      filters['spItemName-like'] = this.queryString;
    }
    return filters;
  }

  private getSortParams(): any {
    if (this.selectedSort === 'a_z') {
      return { 'sort_spItemName': 'asc' };
    }
    if (this.selectedSort === 'z_a') {
      return { 'sort_spItemName': 'desc' };
    }
    if (this.selectedSort === 'price_low') {
      return { 'sort_price': 'asc' };
    }
    if (this.selectedSort === 'price_high') {
      return { 'sort_price': 'desc' };
    }
    return {};
  }

  removeAppliedFilter(filter: { type: 'category' | 'type' | 'group'; id: number }) {
    if (filter.type === 'category') {
      this.selectedCategories = this.selectedCategories.filter((id) => id !== filter.id);
    } else if (filter.type === 'type') {
      this.selectedTypes = this.selectedTypes.filter((id) => id !== filter.id);
    } else if (filter.type === 'group') {
      this.selectedGroups = this.selectedGroups.filter((id) => id !== filter.id);
    }
    this.currentPage = 0;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        categoryId: this.selectedCategories.length ? this.selectedCategories.join(',') : null,
        typeId: this.selectedTypes.length ? this.selectedTypes.join(',') : null,
        groupId: this.selectedGroups.length ? this.selectedGroups.join(',') : null,
        page: this.currentPage
      },
      queryParamsHandling: 'merge'
    });
    this.buildAppliedFilters();
  }

  private buildAppliedFilters(): void {
    const filters: Array<{ type: 'category' | 'type' | 'group'; id: number; label: string }> = [];
    if (this.itemCategories?.length && this.selectedCategories?.length) {
      this.selectedCategories.forEach((id) => {
        const match = this.itemCategories.find((category) => category.id === id);
        if (match) {
          filters.push({ type: 'category', id, label: match.categoryName });
        }
      });
    }
    if (this.itemTypes?.length && this.selectedTypes?.length) {
      this.selectedTypes.forEach((id) => {
        const match = this.itemTypes.find((type) => type.id === id);
        if (match) {
          filters.push({ type: 'type', id, label: match.typeName });
        }
      });
    }
    if (this.itemGroups?.length && this.selectedGroups?.length) {
      this.selectedGroups.forEach((id) => {
        const match = this.itemGroups.find((group) => group.id === id);
        if (match) {
          filters.push({ type: 'group', id, label: match.groupName });
        }
      });
    }
    this.appliedFilters = filters;
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
  getTagLabel(tag: any): string {
    if (!tag) {
      return '';
    }
    return tag.tagName;
  }

  getTagPosition(item: any, tag: any): number {
    if (!item?.itemTags?.length || !tag) {
      return 0;
    }
    const index = item.itemTags.findIndex((t: any) => this.areTagsEqual(t, tag));
    return index >= 0 ? index + 1 : 1;
  }

  private areTagsEqual(a: any, b: any): boolean {
    if (!a || !b) {
      return false;
    }
    if (a.encId && b.encId) {
      return a.encId === b.encId;
    }
    if (a.tagId && b.tagId) {
      return a.tagId === b.tagId;
    }
    if (a.id && b.id) {
      return a.id === b.id;
    }
    if (a.tagName && b.tagName) {
      return a.tagName === b.tagName;
    }
    return a === b;
  }

}



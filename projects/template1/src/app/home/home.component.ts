import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService, AuthService, ConsumerService, GroupStorageService, LocalStorageService, OrderService, SharedService, SubscriptionService, ThemeService } from 'jconsumer-shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnDestroy {

  @ViewChild('header') headerElement!: ElementRef;
  theme: string = '';
  loading: boolean = false;
  accountId: any;
  isSessionCart: any;
  smallmobileDevice: boolean = false;
  cartCount: number;
  cartCountForSessionCart: any;
  hideFooter: boolean = false;
  isLoggedIn: boolean = false;
  loggedUser: any;
  cartFooterSubscription: Subscription;
  config: any;
  smallDevice: boolean = false;
  locations;
  accountConfig: any;
  loginBackground: any;
  alignClass;
  customClass: any;
  loginRequired = true;
  loggedIn: boolean = false;
  oneTimeQnrEnabled: boolean = false;
  onetimeQuestionnaireList: any;
  providerConsumerId: any;
  callback: any;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private orderService: OrderService,
    private sharedService: SharedService,
    private lStorageService: LocalStorageService,
    private accountService: AccountService,
    private router: Router,
    private groupService: GroupStorageService,
    private subscriptionService: SubscriptionService,
    private themeService: ThemeService,
    private authService: AuthService,
    private consumerService: ConsumerService,
    private activatedRoute: ActivatedRoute
  ) {
    this.onResize();
    this.activatedRoute.queryParams.subscribe(qparams => {
      if (qparams && qparams['callback']) {
        this.callback = qparams['callback'];
      }
      if (qparams && qparams['inst_id']) {
        this.lStorageService.setitemonLocalStorage('installId', qparams['inst_id']);
      }
      if (qparams && qparams['app_id']) {
        this.lStorageService.setitemonLocalStorage('appId', qparams['app_id']);
        this.lStorageService.setitemonLocalStorage('dash_visible', true)
      }

      if (qparams && qparams['muid']) {
        this.lStorageService.setitemonLocalStorage('mUniqueId', qparams['muid']);
      }
      if (qparams && qparams['mode']) {
        this.lStorageService.setitemonLocalStorage('ios', true);
      }
      if (qparams && qparams['lan']) {
        if (this.lStorageService.getitemfromLocalStorage('translatevariable')) {
        } else {
          this.lStorageService.setitemonLocalStorage('translatevariable', qparams['lan']);
        }
      }
      if (qparams && qparams['notification']) {
        this.lStorageService.setitemonLocalStorage('appNotification', qparams['notification']);
      }
      // if (this.lStorageService.getitemfromLocalStorage('partner')) {
      //   this.categoryType = 'LAB_SYNC';
      //   this.isPartnerLogin = true;
      // }
    });
    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // };
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.cartFooterSubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 768) {
      this.smallmobileDevice = true;
    }
    if (window.innerWidth < 870) {
      this.smallDevice = true;
    }
  }

  ngAfterViewInit() {
    let account = this.sharedService.getAccountInfo();
    this.accountId = this.sharedService.getAccountID();
    this.accountConfig = this.sharedService.getAccountConfig();
    console.log("Account ID :", this.accountId);
    this.locations = this.sharedService.getJson(account['location']);
    console.log("Locations:", this.locations);
    this.accountService.setActiveLocation(this.locations[0]);
    this.cartFooterSubscription = this.subscriptionService.getMessage().subscribe((message) => {
      switch (message.ttype) {
        case 'refresh':
          console.log("message", message);
          this.hideFooter = false;
          this.initHeader(message.value ? "refresh" : null);
          break;
        case 'cartChanged':
          this.cartCount = message.value;
          this.cartCountForSessionCart = message.value;
          console.log("CartCountChanged11:", this.cartCount);
          break;
        case 'hideCartFooter':
          this.hideFooter = true;
          console.log("CartCountChanged22:", this.cartCount);
          break;
      }
    })
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
      let themeURL = this.sharedService.getCDNPath() + `customapp/assets/scss/themes/`;
      this.themeService.loadTheme(themeURL, this.theme);
    }
    this.authService.goThroughLogin().then((status: any) => {
      if (this.accountConfig['loginRequired'] && !status) {
        this.loginRequired = true;
        if (this.accountConfig['login'] && this.accountConfig['login']['backgroundImage']) {
          this.loginBackground = this.accountConfig['login']['backgroundImage'];
        }
        if (this.accountConfig['login'] && this.accountConfig['login']['align']) {
          this.alignClass = this.accountConfig['login']['align'];
        }
        if (this.accountConfig['login'] && this.accountConfig['login']['className']) {
          this.customClass = this.accountConfig['login']['className'];
        }
      } else {
        this.loginRequired = false;
        this.finishLoading();
      }
    })
  }

  finishLoading() {
    if (this.accountService.getStores().length == 0) {
      this.getStores();
    }
    this.orderService.getRequireOTPForAddingToCart('SALES_ORDER', this.accountId).subscribe((data: any) => {
      if (data) {
        this.isSessionCart = data.requireOTPForAddingToCart;
        this.lStorageService.setitemonLocalStorage('isSessionCart', this.isSessionCart)
        console.log("this.isSessionCart", this.isSessionCart)
      }
    })
    setTimeout(() => {
      this.updateHeaderHeight();
    }, 1000);
  }

  getStores() {
    this.loading = true;
    let filter = {};
    filter['accountId-eq'] = this.accountId;
    filter['onlineOrder-eq'] = true;
    filter['status-eq'] = 'Active';
    this.orderService.getStores(filter).subscribe((stores: any) => {
      if (stores && stores.length > 0) {
        this.accountService.setStores(stores);
        this.accountService.setActiveStore(stores[0].encId);
        this.lStorageService.setitemonLocalStorage('storeEncId', stores[0].encId);
      }
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  initHeader(refresh?) {
    const activeUser = this.groupService.getitemFromGroupStorage('jld_scon');
    if (activeUser) {
      this.isLoggedIn = true;
      this.loggedUser = activeUser;
      console.log(this.loggedUser);
      if (refresh) {
        this.setCartCount(this.loggedUser.providerConsumer ? this.loggedUser.providerConsumer : this.loggedUser.id);
      }
    } else {
      if (!this.isSessionCart) {
        this.cartCount = this.cartCountForSessionCart;
      } else {
        this.cartCount = 0;
      }
      this.isLoggedIn = false;
    }
  }

  setCartCount(userID) {
    this.orderService.getCart(userID).subscribe(
      (cartInfo: any) => {
        if (cartInfo && cartInfo.items && cartInfo.items.length > 0) {
          this.cartCount = cartInfo.items.length;
        }
      }
    )
  }

  viewCart() {
    this.router.navigate([this.sharedService.getRouteID(), 'order', 'cart'])
  }

  updateHeaderHeight() {
    if (this.headerElement) {
      const height = this.headerElement.nativeElement.offsetHeight;
      console.log("Height:", height)
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }

  actionPerformed(status) {
    const _this = this;
    if (status) {
      _this.loggedIn = true;
      if (_this.accountConfig['oneTimeQnrEnabled']) {
        _this.loggedUser = _this.groupService.getitemFromGroupStorage('ynw-user');
        _this.providerConsumerId = _this.loggedUser.providerConsumer;
        _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
          (questions) => {
            if (questions) {
              _this.onetimeQuestionnaireList = questions;
              if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                _this.oneTimeQnrEnabled = true;
              } else {
                _this.oneTimeQnrEnabled = false;
                _this.loginRequired = false;
                _this.finishLoading();
              }
            }
          }
        )
      } else {
        _this.loginRequired = false;
        _this.finishLoading();
      }
    } else {
      _this.loginRequired = false;
      _this.finishLoading();
    }
  }

  getOneTimeInfo(providerConsumerID, accountId) {
    const _this = this;
    console.log("Get one time info:", providerConsumerID);
    return new Promise(function (resolve, reject) {
      _this.subscriptions.add(_this.consumerService.getProviderCustomerOnetimeInfo(providerConsumerID, accountId).subscribe(
        (questions) => {
          resolve(questions);
        }, () => {
          resolve(false);
        }
      ))
    })
  }
    oneTimeQnrActionPerformed(status) { 
    if(status) {
      this.loginRequired = false;
      this.finishLoading();
    }
  }
}

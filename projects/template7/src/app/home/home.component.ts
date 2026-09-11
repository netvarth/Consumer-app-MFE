import { Component, DoCheck, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AccountService, AuthService, ConsumerService, GroupStorageService, LocalStorageService, OrderService, SharedService, SubscriptionService, ThemeService } from 'jconsumer-shared';
import { Subscription } from 'rxjs';
import { persistDeviceIdentity } from '../../../../cross-tenant/helpers/device-identity.service';
import { TRANSIENT_ACCOUNT_KEYS } from '@consumer/cross-tenant';
import { TemplateHomeState } from './template-home/template-home-state.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [TemplateHomeState]
})
export class HomeComponent implements OnInit, DoCheck, OnDestroy {

  @ViewChild('header') headerElement!: ElementRef;
  private footerObserver?: ResizeObserver;
  @ViewChild('footerNav') set footerNav(element: ElementRef<HTMLElement> | undefined) {
    this.footerObserver?.disconnect();
    if (!element || typeof ResizeObserver === 'undefined') return;
    this.footerObserver = new ResizeObserver(() => {
      this.renderer.setStyle(this.hostElement.nativeElement, '--sub-app-footer-height', `${element.nativeElement.getBoundingClientRect().height}px`);
    });
    this.footerObserver.observe(element.nativeElement);
  }
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
  showWelcomePopup = false;
  welcomeImageUrl = '';
  templateJson;
  welcomePopupStorageKey = 'welcomePopupShown';
  private welcomePopupTimer: any;
  private subscriptions: Subscription = new Subscription();
  header: boolean = true;
  isImmersiveRoute = false;
  footerItems: any[] = [];
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
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private hostElement: ElementRef<HTMLElement>,
    public homeState: TemplateHomeState
  ) {
    this.onResize();
    this.loadFontAwesome();
    this.activatedRoute.queryParams.subscribe(qparams => {
      if (qparams && qparams['cl_dt']) {
        console.log(qparams['cl_dt']);
        if (qparams['cl_dt'] == "true" || qparams['cl_dt'] == true) {
          this.clearTenantDraftState();
        }
      }
      if (qparams && qparams['callback']) {
        this.callback = qparams['callback'];
      }
      persistDeviceIdentity(qparams, this.lStorageService);
      if (qparams && qparams['app_id']) {
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
    if (this.welcomePopupTimer) {
      clearTimeout(this.welcomePopupTimer);
    }
    this.subscriptions.unsubscribe();
    this.cartFooterSubscription?.unsubscribe();
    this.footerObserver?.disconnect();
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

  setLoginProperties() {
    console.log(this.accountConfig);

    if (this.accountConfig && this.accountConfig['login']) {
      if (this.accountConfig['login'] && this.accountConfig['login']['backgroundImage']) {
        this.loginBackground = this.accountConfig['login']['backgroundImage'];
      }
      if (this.accountConfig['login'] && this.accountConfig['login']['align']) {
        this.alignClass = this.accountConfig['login']['align'];
      }
      if (this.accountConfig['login'] && this.accountConfig['login']['className']) {
        this.customClass = this.accountConfig['login']['className'];
      }
    }
  }

  ngDoCheck(): void {
    if (this.homeState.sync()) {
      this.templateJson = this.sharedService.getTemplateJSON();
      this.config = this.templateJson || {};
      this.footerItems = this.homeState.config.status === 'legacy' ? this.buildFooterItems(this.templateJson) : [];
      this.isImmersiveRoute = this.isFullWidthRoute(this.router.url);
      const account = this.sharedService.getAccountInfo();
      if (account && this.homeState.routeId && this.accountId !== this.sharedService.getAccountID()) {
        const changedTenant = this.accountId != null;
        this.accountId = this.sharedService.getAccountID();
        this.accountConfig = this.sharedService.getAccountConfig();
        this.locations = this.sharedService.getJson(account['location']) || [];
        this.accountService.setActiveLocation(this.locations[0] || null);
        this.header = true;
        this.hideFooter = false;
        if (changedTenant) {
          this.accountService.setStores([]);
          this.accountService.setActiveStore(null);
          this.lStorageService.removeitemfromLocalStorage('storeEncId');
          this.cartCount = 0;
        }
        this.loginRequired = (this.accountConfig?.loginRequired ?? this.config.loginRequired) === true;
        const accountId = this.accountId;
        this.authService.goThroughLogin().then(status => {
          if (this.accountId !== accountId) return;
          if (!this.loginRequired || status) { this.loginRequired = false; this.finishLoading(); }
          else this.setLoginProperties();
        });
      }
    }
  }

  ngOnInit() {
    let account = this.sharedService.getAccountInfo();
    this.accountId = account ? this.sharedService.getAccountID() : null;
    this.accountConfig = this.sharedService.getAccountConfig();
    console.log("Account ID :", this.accountId);
    this.locations = account ? this.sharedService.getJson(account['location']) || [] : [];
    console.log("Locations:", this.locations);
    if (this.locations.length && !this.accountService.getActiveLocation()) this.accountService.setActiveLocation(this.locations[0]);
    this.config = this.sharedService.getTemplateJSON() || {};
    this.loginRequired = (this.accountConfig?.loginRequired ?? this.config.loginRequired) === true;
    if (this.config.theme) {
      this.theme = this.config.theme;
      let themeURL = this.sharedService.getCDNPath() + `customapp/assets/scss/themes/`;
      this.themeService.loadTheme(themeURL, this.theme);
    }
    const initialAccountId = this.accountId;
    if (this.accountConfig) {
      if (this.accountConfig['theme']) {
        this.theme = this.accountConfig['theme'];
      }
      this.authService.goThroughLogin().then((status: any) => {
        if (this.accountId !== initialAccountId) return;
        if (this.accountConfig['loginRequired'] && !status) {
          this.loginRequired = true;
          this.setLoginProperties();
        } else {
          this.loginRequired = false;
          this.finishLoading();
        }
      })
    } else {
      this.loginRequired = this.config.loginRequired === true;
      if (!this.loginRequired) this.finishLoading();
    }

    this.cartFooterSubscription = this.subscriptionService.getMessage().subscribe((message) => {
      switch (message.ttype) {
        case 'refresh':
          console.log("message", message);
          this.hideFooter = false;
          this.initHeader(message.value ? "refresh" : null);
          // Re-evaluate auth state when other modules broadcast refresh (e.g., login route)
          this.authService.goThroughLogin().then((status: any) => {
            if (this.accountConfig?.['loginRequired'] && !status) {
              this.loginRequired = true;
              this.setLoginProperties();
            } else {
              this.loginRequired = false;
              this.finishLoading();
            }
          });
          break;
        case 'logout':
          // On logout, show the login overlay again if login is required
          this.isLoggedIn = false;
          this.loggedIn = false;
          if (this.accountConfig && this.accountConfig['loginRequired']) {
            this.loginRequired = true;
            this.setLoginProperties();
          }
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
        case 'hideHeader':
          this.header = false;
          break;
        case 'showHeader':
          this.header = true;
          break;
      }
    })

    const alreadyLoggedIn = this.checkLogin && this.checkLogin();
    this.templateJson = this.sharedService.getTemplateJSON();
    this.homeState.sync();
    this.footerItems = this.homeState.config.status === 'legacy' ? this.buildFooterItems(this.templateJson) : [];
    console.log("this.templateJson", this.templateJson)
    const welcomePopupState = this.lStorageService.getitemfromLocalStorage(this.welcomePopupStorageKey) || {};
    const hasSeenWelcomePopup = welcomePopupState && welcomePopupState[this.accountId];
    if (!alreadyLoggedIn && this.accountConfig?.welcomePageEnabled && this.templateJson?.welcomePage && !hasSeenWelcomePopup) {
      this.welcomeImageUrl = this.templateJson.welcomePage;
      this.showWelcomePopup = true;
      welcomePopupState[this.accountId] = true;
      this.lStorageService.setitemonLocalStorage(this.welcomePopupStorageKey, welcomePopupState);
      this.welcomePopupTimer = setTimeout(() => {
        this.showWelcomePopup = false;
      }, 10000);
    }

    this.isImmersiveRoute = this.isFullWidthRoute(this.router.url);

    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.isImmersiveRoute = this.isFullWidthRoute(event.urlAfterRedirects);
          if (this.homeState.isSubApp && this.homeState.isRoot) { this.header = true; this.hideFooter = false; }
          this.scrollToTop();
        }
      })
    );

  }

  private isFullWidthRoute(url: string): boolean {
    if (this.homeState.isSubApp) return false;
    const path = url.split('?')[0];
    const petStoreRoute = this.templateJson?.petStorePage?.route || 'pet-store';
    const hidePetStoreHeader = this.templateJson?.petStorePage?.layout?.hideParentHeader !== false;
    if (hidePetStoreHeader && path.includes(`/${petStoreRoute}`)) return true;
    return path.endsWith('/pet-store') || path.endsWith('/service-stores') || /\/service-store\/[^/]+$/.test(path);
  }

  get showParentFooter(): boolean {
    if (this.homeState.isSubApp) return !this.hideFooter && this.homeState.config.footer.length > 0;
    if (this.hideFooter || !this.footerItems.length) return false;
    const petStoreRoute = this.templateJson?.petStorePage?.route || 'pet-store';
    if (this.router.url.split('?')[0].includes(`/${petStoreRoute}`)) {
      return this.templateJson?.petStorePage?.layout?.useParentFooterNavigation !== false;
    }
    return true;
  }

  navigateFooter(item: any): void {
    const routeId = this.sharedService.getRouteID();
    const link = item.__route || item.link || (item.key === 'home' ? '' : item.key);
    if (!link) {
      void this.router.navigate([routeId]);
      return;
    }
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
    let normalized = link;
    while (normalized.startsWith('/')) normalized = normalized.slice(1);
    if (normalized.startsWith('capp/')) normalized = normalized.slice(5);
    const segments = normalized === routeId || normalized.startsWith(`${routeId}/`)
      ? normalized.split('/')
      : [routeId, ...normalized.split('/')];
    void this.router.navigate(segments);
  }

  isFooterItemActive(item: any): boolean {
    const path = this.router.url.split('?')[0];
    const routeId = this.sharedService.getRouteID();
    if (item.key === 'shop') return path.includes('/pet-store');
    if (item.key === 'home') return path === `/${routeId}` || path === `/${routeId}/`;
    let route = (item.__route || item.link || item.key || '').split('?')[0];
    while (route.startsWith('/')) route = route.slice(1);
    return !!route && (path.endsWith(`/${route}`) ||
      (item.key === 'bookings' && (path.endsWith('/bookings') || path.endsWith('/dashboard'))));
  }

  private buildFooterItems(template: any): any[] {
    if (!template) return [];
    const configuredShop = template.petStorePage?.footerNavigationItem;
    const shop = template.petStorePage?.enabled === false ? null : {
      key: 'shop',
      title: configuredShop?.label || template.petStorePage?.hero?.intro?.title,
      icon: configuredShop?.icon || '',
      fallbackIcon: 'fa-shopping-bag',
      __route: template.petStorePage?.route || 'pet-store'
    };
    return [template.section1, template.section3, shop, template.section2, template.section4, template.section5]
      .filter((item, index, items) => item && items.findIndex(candidate => candidate?.key === item.key) === index);
  }

  private ensureTrailingSlash(path: string): string {
    if (!path) {
      return '';
    }
    return path.endsWith('/') ? path : `${path}/`;
  }

  private loadFontAwesome() {
    if (document.getElementById('font-awesome-css')) {
      return;
    }
    const cdnBase = this.ensureTrailingSlash(this.sharedService.getCDNPath() || 'https://jaldeeassets-test.s3.ap-south-1.amazonaws.com/');
    const href = `${cdnBase}global/font-awesome-v4.7/css/font-awesome.min.css`;
    const link = this.renderer.createElement('link');
    link.id = 'font-awesome-css';
    link.rel = 'stylesheet';
    link.href = href;
    this.renderer.appendChild(document.head, link);
  }



  finishLoading() {
    if (this.accountId == null) return;
    const accountId = this.accountId;
    if (this.accountService.getStores().length == 0) {
      this.getStores();
    }
    this.orderService.getRequireOTPForAddingToCart('SALES_ORDER', this.accountId).subscribe((data: any) => {
      if (this.accountId !== accountId) return;
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
    const accountId = this.accountId;
    this.loading = true;
    let filter = {};
    filter['accountId-eq'] = this.accountId;
    filter['onlineOrder-eq'] = true;
    filter['status-eq'] = 'Active';
    this.orderService.getStores(filter).subscribe((stores: any) => {
      if (this.accountId !== accountId) return;
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
        _this.loggedUser = _this.groupService.getitemFromGroupStorage('jld_scon');
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
    if (status) {
      this.loginRequired = false;
      this.finishLoading();
    }
  }

  private scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0 });
    }
  }
  checkLogin() {
    const login = (this.lStorageService.getitemfromLocalStorage('ynw-credentials')) ? true : false;
    return login;
  }
  closeWelcomePopup() {
    this.showWelcomePopup = false;
    if (this.welcomePopupTimer) {
      clearTimeout(this.welcomePopupTimer);
    }
  }
  private clearTenantDraftState(): void {
    TRANSIENT_ACCOUNT_KEYS.forEach((key) => this.lStorageService.removeitemfromLocalStorage(key));
  }
}

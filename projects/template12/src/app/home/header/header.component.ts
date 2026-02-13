import { Component, HostListener, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AccountService, AuthService, GroupStorageService, LocalStorageService, Messages, OrderService, SharedService, SubscriptionService } from 'jconsumer-shared';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './modal.scss']
})
export class HeaderComponent implements OnInit {
  restrictNavigation: boolean = false;
  isLoggedIn: boolean = false;
  loggedUser: any;
  logo: any;
  valueToSearch: any;
  categorySelected: any;
  dashboard_cap = Messages.DASHBOARD_TITLE;
  logout_cap = Messages.LOGOUT_CAP;
  user_profile = Messages.USER_PROF_CAP;
  categories = [
    { name: 'All', value: 'all' },
    { name: 'Food Items', value: 'items' }
  ]
  searchOption: any = false;
  theme: any;
  cartCount: number = 0;
  config: any;
  accountID: any;
  hideItemSearch: any = false;
  storeEncId: any;
  isSessionCart: any;
  cdnPath: string = '';
  smallDevice: boolean = false;
  selectedCatalogs: any = [];
  showLocation;
  hideBookings: boolean;
  header: boolean = true;
  locations;
  headerName: any;
  isCartVisible: boolean;
  private subscriptions: Subscription = new Subscription();
  selectedLocation: any;
  activeMenuItem = '';
  hideLocationGlobal: boolean = false;


  constructor(
    private lStorageService: LocalStorageService,
    private subscriptionService: SubscriptionService,
    private groupService: GroupStorageService,
    private router: Router,
    private sharedService: SharedService,
    private authService: AuthService,
    public translate: TranslateService,
    private orderService: OrderService,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.onResize();
    this.activatedRoute.queryParams.subscribe((qparams: any) => {
      if (qparams['_t'] && qparams['_t'] !== '') {
        this.activeMenuItem = qparams['_t'];
      } else {
        this.activeMenuItem = '';
      }
    })
    console.log("Order Header Compoent Constructor");
    this.accountID = this.sharedService.getAccountID();
    this.storeEncId = this.lStorageService.getitemfromLocalStorage('storeEncId')
    this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart')
    this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.initHeader('refresh');
  }
  initHeader(refresh: any) {
    const activeUser = this.groupService.getitemFromGroupStorage('jld_scon');
    if (activeUser) {
      this.isLoggedIn = true;
      this.loggedUser = activeUser;
      console.log(this.loggedUser);
      if (refresh) {
        this.setCartCount(this.loggedUser.providerConsumer ? this.loggedUser.providerConsumer : this.loggedUser.id);
      }
    } else {
      if (this.isSessionCart) {
        this.isLoggedIn = false;
        this.cartCount = 0;
      } else {
        if (this.lStorageService.getitemfromLocalStorage('cartData')) {
          let cartData = this.lStorageService.getitemfromLocalStorage('cartData');
          const hdCount = cartData?.HOME_DELIVERY?.items?.length || 0;
          const spCount = cartData?.STORE_PICKUP?.items?.length || 0;

          if (hdCount > 0 || spCount > 0) {
            this.cartCount = hdCount + spCount;
          }
        } else {
          this.isLoggedIn = false;
          this.cartCount = 0;
        }
      }
    }
  }
  setCartCount(userID: any) {
    this.orderService.getCart(userID).subscribe(
      (cartInfo: any) => {
        const count1 = cartInfo[0]?.items?.length || 0;
        const count2 = cartInfo[1]?.items?.length || 0;

        if (count1 > 0 || count2 > 0) {
          this.cartCount = count1 + count2;
        }
      }
    )
  }
  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    const showCartConfig = this.config?.header?.showCart;
    this.isCartVisible = showCartConfig === undefined || showCartConfig === null
      ? true
      : !(showCartConfig === false || showCartConfig === 'false');
    this.headerName = this.config.header?.name ? this.config.header.name : 'header1';
    if (this.config && this.config['theme']) {
      this.theme = this.config['theme'];
    }
    let accountConfig = this.sharedService.getAccountConfig();
    if (accountConfig?.locationVisible) {
      this.hideLocationGlobal = accountConfig?.locationVisible;
    }
    this.accountID = this.sharedService.getAccountID();
    if (this.config?.extras?.selectedCatalogs?.length > 0) {
      console.log("this.config", this.config)
      this.selectedCatalogs = this.config?.extras?.selectedCatalogs;
      console.log("this.configthis.selectedCatalogs", this.selectedCatalogs)
    }
    let account = this.sharedService.getAccountInfo();
    this.locations = this.sharedService.getJson(account['location']);
    let accountProfile = this.accountService.getJson(account['businessProfile']);
    if (accountProfile.businessLogo && accountProfile.businessLogo.length > 0) {
      this.logo = accountProfile.businessLogo[0].s3path;
    } else {
      this.logo = accountProfile.logo?.url;
    }
    this.initSubscriptions();
    this.initHeader(null);
    const activeLoc = this.accountService.getActiveLocation();
    if (activeLoc) {
      this.selectedLocation = activeLoc;
      this.showLocation = true;
      if (!this.accountService.getAccountLocations()) {
        this.accountService.setAccountLocations(this.locations);
      }
    } else {
      this.setAccountLocations(this.locations);
      this.showLocation = true;
    }
  }
  setAccountLocations(locations: any) {
    this.locations = locations;
    this.accountService.setAccountLocations(locations);
    // console.log(this.locations);
    let activeLocation = this.lStorageService.getitemfromLocalStorage('activeLocation');
    let defaultLocation;
    if (activeLocation) {
      for (let i = 0; i < locations.length; i++) {
        const addres = locations.address;
        const place = locations.place;
        if (addres && addres.includes(place)) {
          this.locations['isPlaceisSame'] = true;
        } else {
          this.locations['isPlaceisSame'] = false;
        }
        if (locations[i].id === activeLocation) {
          defaultLocation = locations[i];
        }
        if (this.locations[i].parkingType) {
          this.locations[i].parkingType = this.locations[i].parkingType.charAt(0).toUpperCase() + this.locations[i].parkingType.substring(1);
        }
      }
    } else {
      for (let i = 0; i < locations.length; i++) {
        const addres = locations.address;
        const place = locations.place;
        if (addres && addres.includes(place)) {
          this.locations['isPlaceisSame'] = true;
        } else {
          this.locations['isPlaceisSame'] = false;
        }
        if (locations[i].baseLocation) {
          defaultLocation = locations[i];
        }
        if (this.locations[i].parkingType) {
          this.locations[i].parkingType = this.locations[i].parkingType.charAt(0).toUpperCase() + this.locations[i].parkingType.substring(1);
        }
      }
    }
    this.accountService.setActiveLocation(defaultLocation);
    this.changeLocation(defaultLocation);
  }
  initSubscriptions() {
    let sub = this.subscriptionService.getMessage().subscribe((message: { ttype: any; value: number; }) => {
      switch (message.ttype) {
        case 'restrict':
          this.restrictNavigation = true;
          break;
        case 'refresh':
          console.log("message", message);
          this.hideItemSearch = false;
          this.searchOption = false;
          this.initHeader(message.value ? "refresh" : null);
          break;
        case 'cartChanged':
          this.cartCount = message.value;
          console.log("Cart Count Changed:", this.cartCount);
          break;
        case 'hideItemSearch':
          this.hideItemSearch = true;
          break;
        case 'hideLocation':
          this.showLocation = false;
          break;
        case 'showLocation':
          this.makeLocationVisible();
          break;
        case 'changeLocation':
          console.log("Chang Loc:", message.value);
          this.changeLocation(message.value);
          break;
        case 'hideBookings':
          if (this.isLoggedIn) {
            this.hideBookings = true;
          } else {
            this.hideBookings = false;
          }
          break;
        case 'hideBookingsAndLocations':
          this.hideBookings = true;
          this.showLocation = false;
          break;
        case 'hideHeader':
          this.header = false;
          break;
        case 'showHeader':
          this.header = true;
          break;
      }
    })
    this.subscriptions.add(sub);
  }
  makeLocationVisible() {
    console.log("Locations:", this.locations);

    if (this.locations.length > 1) {
      this.showLocation = true;
    } else {
      this.showLocation = false;
    }
  }
  changeLocation(location) {
    const response = {
      ttype: 'locationChanged'
    }
    this.selectedLocation = location;
    this.accountService.setActiveLocation(this.selectedLocation);
    this.lStorageService.setitemonLocalStorage('c-location', this.selectedLocation.id);
    this.subscriptionService.sendMessage(response);
  }
  menuClicked(action) {
    if (action.link && action.link.startsWith('http')) {
      window.open(action.link, "_system");
    } else {
      this.activeMenuItem = action.link;
      const queryParams = { ['_t']: action.link };
      this.router.navigate([this.sharedService.getRouteID()], {
        queryParams: queryParams,
        queryParamsHandling: 'merge'
      }).then(() => {
        // this.router.navigate[(this.sharedService.getRouteID())];
      });
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 870) {
      this.smallDevice = true;
    }
  }

  doLogout() {
    const _this = this;
    this.authService.doLogout().then(
      () => {
        _this.initHeader(null);
        _this.gotoActiveHome(true);
        _this.subscriptionService.sendMessage({ ttype: 'hideCartFooter', value: 0 });
      }
    );
  }
   inboxiconClick() {
    this.redirectto('inbox');
  }
  redirectto(mod: string) {
    switch (mod) {
      case 'profile':
        this.router.navigate([this.sharedService.getRouteID(), 'profile']);
        break;
      case 'inbox':
        let qParams = {};
        const navigationExtras1: NavigationExtras = {
          queryParams: qParams
        };
        this.router.navigate([this.sharedService.getRouteID(), 'inbox'], navigationExtras1);
        break;
      case 'dashboard':
        this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
        break;
      case 'home':
        this.router.navigate([this.sharedService.getRouteID()]);
        break;
      case 'about':
        this.router.navigate([this.sharedService.getRouteID(), 'about']);
        break;
      case 'blogs':
        this.router.navigate([this.sharedService.getRouteID(), 'blogs']);
        break;
      case 'contactus':
        this.router.navigate([this.sharedService.getRouteID(), 'contactus']);
        break;
    }
  }
  showSearch() {
    this.searchOption = !this.searchOption;
  }
  dashboardClicked() {
    const _this = this;
    this.searchOption = false;
    _this.authService.goThroughLogin().then(
      (status: any) => {
        if (status) {
          this.viewDashboard();
        } else {
          let dashboardUrl = this.sharedService.getRouteID() + '/bookings';
          this.lStorageService.setitemonLocalStorage('target', dashboardUrl);
          this.router.navigate([this.sharedService.getRouteID(), 'login']);
        }
      });
  }
  viewDashboard() {
    let dashboardUrl = this.sharedService.getRouteID() + '/bookings';
    this.router.navigateByUrl(dashboardUrl);
  }
  gotoActiveHome(isLoggedOut?: boolean) {
    const source = this.lStorageService.getitemfromLocalStorage('source');
    console.log("Source:", source);
    if (source) {
      this.lStorageService.removeitemfromLocalStorage('source');
      this.lStorageService.removeitemfromLocalStorage('reqFrom');
      window.location.href = source;
    } else {
      // if (!this.restrictNavigation) {
      this.lStorageService.setitemonLocalStorage('storeEncId', this.storeEncId);
      this.lStorageService.setitemonLocalStorage('isSessionCart', this.isSessionCart);
      this.router.navigate([this.sharedService.getRouteID()]);
      // Inform Home to refresh state after navigating home
      // this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
      if (isLoggedOut) {
        this.subscriptionService.sendMessage({ ttype: 'logout', value: 0 });
      }
    }
  }

  goToCart() {
    this.router.navigate([this.sharedService.getRouteID(), 'order', 'cart'])
  }

  selectedItemsEmit(event: any) {
    console.log('eventselectedItemsEmit', event);
    if (event?.query) {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          query: event.query
        }
      }
      this.router.navigate([this.sharedService.getRouteID(), 'items'], navigationExtras);
    } else {
      this.router.navigate([this.sharedService.getRouteID(), 'item', event?.value?.encId]);
    }
  }

  isSubmenuActive(menuItem: any): boolean {
    if (!menuItem.submenu?.length) return false;
    return menuItem.submenu.some(subItem => this.activeMenuItem === subItem.link);
  }
  showSubmenu(menuItem: any) {
    menuItem.showSubmenu = true;
  }

  hideSubmenu(menuItem: any) {
    menuItem.showSubmenu = false;
  }
  handleMenuItemClick(menuItem: any) {
    if (menuItem.link || (menuItem.title == 'Home' && !menuItem.submenu?.length)) {
      this.menuClicked(menuItem);
    } else if (menuItem.submenu?.length) {
      // Toggle submenu for items without links but with submenus
      menuItem.showSubmenu = !menuItem.showSubmenu;
    }
  }

}

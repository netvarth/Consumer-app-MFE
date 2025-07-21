
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd, NavigationExtras } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { AccountService } from '../../services/account-service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { GroupStorageService } from 'jaldee-framework/storage/group';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit, OnDestroy {
  @Input() locations;
  user_profile = Messages.USER_PROF_CAP;
  change_mobile = Messages.CHANGE_MOB_CAP;
  add_change_email = Messages.ADD_CHANGE_EMAIL;
  logout_cap = Messages.LOGOUT_CAP;
  close_btn = Messages.CLOSE_BTN;
  dashboard_cap = Messages.DASHBOARD_TITLE;
  family_members = Messages.FAMILY_MEMBERS;
  refreshTime = projectConstantsLocal.INBOX_REFRESH_TIME;
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  small_device_display = false;
  show_small_device_queue_display = false;
  returnedFromCheckDetails = false;
  apis_loaded = false;
  noFilter = true;
  arr: any = [];
  server_date: string | undefined;
  isServiceBillable = true;
  userdet: any = [];
  headercls = '';
  provider_loggedin = false;
  consumer_loggedin = false;
  curPgurl = '';
  evnt;
  license_message = '';
  bsector = '';
  bsubsector = '';
  blogo = '';
  showmobileSubmenu = false;
  showlocation = false;
  tooltipcls = '';
  avoidClear = 1;
  upgradablepackages: any = [];
  main_loading = false;
  inboxiconTooltip = '';
  custsignTooltip = '';
  provsignTooltip = '';
  api_error: any = null;
  showLearnMore = false;
  screenHeight: any;
  origin = 'header';
  // account_type;
  licenseMetrics: any = [];
  selectedpkgMetrics: any = [];
  theme: any;
  appLogo = false;
  screenWidth: number | undefined;
  subscription: Subscription;
  selectedLocation: any;
  isLoggedIn: boolean;
  showLocation;
  showLanguage;
  headerSubscription: Subscription;
  hideBookings: boolean;
  accountConfig: any;
  logo: any;
  languages: any;
  selectedLanguage: any;
  logoCss: any;
  cartCount: number = 0;
  loggedUser: any;
  storeEncId: any;
  isSessionCart: any;
  onlineOrder: any = false;
  constructor(
    private router: Router,
    private wordProcessor: WordProcessor,
    private accountService: AccountService,
    private authService: AuthService,
    private groupService: GroupStorageService,
    public translate: TranslateService,
    private lStorageService: LocalStorageService
  ) {
    console.log("Header Constructor");
    
    if(this.lStorageService.getitemfromLocalStorage('onlineOrder')) {
      this.onlineOrder = this.lStorageService.getitemfromLocalStorage('onlineOrder');
    }
    this.storeEncId = this.lStorageService.getitemfromLocalStorage('storeEncId');
    this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart');
    if (localStorage.getItem('translatevariable')) {
      this.selectedLanguage = JSON.parse(localStorage.getItem('translatevariable'));
    }
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.initHeader();
    // this.onResize();
    this.evnt = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
      }
    });
    // subscribe to home component messages
    this.headerSubscription = this.accountService.getMessage().subscribe((message) => {
      switch (message.ttype) {
        case 'refresh':
          this.initHeader(message.value ? "refresh" : null);
          break;
        case 'hideLocation':
          this.showLocation = false;
          // this.handleHeaderclassbasedonURL();
          break;
        case 'showLocation':
          this.showLocation = true;
          // this.handleHeaderclassbasedonURL();
          break;
        case 'showLanguages':
          console.log("Languages", message.data);
          this.showLanguage = true;
          this.languages = message.data;
          break;
        case 'hideBookings':
          this.hideBookings = true;
          break;
        case 'hideBookingsAndLocations':
          this.hideBookings = true;
          this.showLocation = false;
          break;
        case 'changeLocation':
          this.selectedLocation = message.data;
          break;
        case 'cartChanged':
          this.cartCount = message.value;
          console.log("Cart Count Changed:", this.cartCount);
          break;
      }
    });
    // this.subscription = this.authService.getMessage().subscribe(message => {
    //   switch (message.ttype) {
    //     case 'refresh':
    //       this.initHeader();
          // this.handleHeaderclassbasedonURL();
          // break;
        // case 'main_loading':
        //   this.main_loading = message.action || false;
        //   break;
        // case 'load_unread_count':
        //   if (!message.action) {
        //     if (!this.customId) {
        //       this.getInboxUnreadCnt();
        //     }
        //   } else if (message.action === 'setzero') {
        //     this.inboxUnreadCnt = 0;
        //     this.inboxCntFetched = true;
        //   }
        //   break;
      // }
    // });
    this.initHeader('refresh');
  }
  initHeader(refresh?) {
    // console.log("Header Init");
    const activeUser = this.groupService.getitemFromGroupStorage('ynw-user');
    if (activeUser) {
      this.isLoggedIn = true;
      // this.userdet = activeUser;
      this.loggedUser = activeUser;
      console.log(this.loggedUser);
      // if (refresh && this.onlineOrder) {
      //   this.setCartCount(this.loggedUser.providerConsumer ? this.loggedUser.providerConsumer : this.loggedUser.id);
      // }
    } else {
      if(this.isSessionCart) {
        this.isLoggedIn = false;
        this.cartCount = 0;
      } else {
        if (this.lStorageService.getitemfromLocalStorage('cartData')  && this.onlineOrder) {
          let cartData = this.lStorageService.getitemfromLocalStorage('cartData');
          if(cartData && cartData.items && cartData.items.length > 0)
          this.cartCount = cartData.items.length;
        } else {
          this.isLoggedIn = false;
          this.cartCount = 0;
        }
      }
    }
  }
  ngOnInit() {
    // if (this.lStorageService.getitemfromLocalStorage('reqFrom') === 'cuA' || this.lStorageService.getitemfromLocalStorage('reqFrom') === 'CUSTOM_WEBSITE') {
    //   this.appLogo = true;
    // }
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    if (this.accountConfig && this.accountConfig['customApp'] && this.accountConfig['customApp']['logoProperties']) {
      this.logoCss = this.accountConfig['customApp']['logoProperties'];
    }
    let account = this.accountService.getAccountInfo();
    let accountProfile = this.accountService.getJson(account['businessProfile']);
    if (accountProfile.businessLogo && accountProfile.businessLogo.length > 0) {
      this.logo = accountProfile.businessLogo[0].s3path;
    } else {
      this.logo = accountProfile.logo?.url;
    }
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.inboxiconTooltip = this.wordProcessor.getProjectMesssages('INBOXICON_TOOPTIP');
    this.initHeader();
    if (this.accountService.getAccountLocations()) {
      this.selectedLocation = this.accountService.getActiveLocation();
      this.showLocation = true;
    } else {
      this.setAccountLocations(this.locations);
      this.showLocation = true;
    }

  }

  setCartCount(userID) {
    this.accountService.getCart(userID).subscribe(
      (cartInfo: any) => {
        if (cartInfo && cartInfo.items && cartInfo.items.length > 0) {
          this.cartCount = cartInfo.items.length;
        }
      }
    )
  }
  showHidemobileSubMenu() {
    if (this.showmobileSubmenu) {
      this.showmobileSubmenu = false;
    } else {
      this.showmobileSubmenu = true;
    }
  }
  changeLocation(location) {
    const response = {
      ttype: 'locationChanged'
    }
    this.selectedLocation = location;
    this.lStorageService.setitemonLocalStorage('activeLocation', location.id);
    this.accountService.setActiveLocation(this.selectedLocation);
    this.lStorageService.setitemonLocalStorage('c-location', this.selectedLocation.id);
    this.accountService.sendMessage(response);
  }
  changeLanguage(lan) {
    this.selectedLanguage = lan;
    this.lStorageService.setitemonLocalStorage('translatevariable', lan);
    this.initHeader();
    this.translate.setDefaultLang(lan);
    this.translate.use(this.lStorageService.getitemfromLocalStorage('translatevariable'));
    const response = {
      ttype: 'languageChanged'
    }
    this.accountService.sendMessage(response);
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
  ngOnDestroy() {
    if (this.evnt) {
      this.evnt.unsubscribe();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  // @HostListener('window:resize', ['$event'])
  // onResize() {
  //   this.screenHeight = window.innerHeight;
  //   this.screenWidth = window.innerWidth;
  //   if (this.screenWidth <= projectConstantsLocal.SMALL_DEVICE_BOUNDARY) {
  //     this.small_device_display = true;
  //   } else {
  //     this.small_device_display = false;
  //   }
  // }

  doLogout() {
    const _this = this;
    this.authService.doLogout().then(
      () => {
        _this.initHeader();
        this.gotoActiveHome();
      }
    );
  }
  inboxiconClick() {
    this.redirectto('inbox');
  }
  redirectto(mod: string) {
    this.showmobileSubmenu = false;
    switch (mod) {
      case 'profile':
        this.router.navigate([this.accountService.getCustomId(), 'profile']);
        break;
      case 'inbox':
        let qParams = {};
        const navigationExtras1: NavigationExtras = {
          queryParams: qParams
        };
        this.router.navigate([this.accountService.getCustomId(), 'inbox'], navigationExtras1);
        break;
      case 'dashboard':
        this.router.navigate([this.accountService.getCustomId(), 'dashboard']);
        break;
      case 'members':
        this.router.navigate([this.accountService.getCustomId(), 'members']);
        break;
    }
  }
  gotoActiveHome() {
    // Custom Website ****************************************
    const source = this.lStorageService.getitemfromLocalStorage('source');
    console.log("Source:", source);
    if (source) {
      this.lStorageService.removeitemfromLocalStorage('source');
      this.lStorageService.removeitemfromLocalStorage('reqFrom');
      window.location.href = source;
    } else {
      // *******************************************************

      // QR Page ***********************************************
      this.lStorageService.removeitemfromLocalStorage('tabIndex');
      this.lStorageService.removeitemfromLocalStorage('action-src');
      this.router.navigate([this.accountService.getCustomId()]);
      // *******************************************************
    }
  }
  dashboardClicked() {
    const _this = this;
    _this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          this.viewDashboard();
        } else {
          let dashboardUrl = this.accountService.getCustomId() + '/dashboard';
          this.lStorageService.setitemonLocalStorage('target', dashboardUrl);
          this.router.navigate([this.accountService.getCustomId(), 'login']);
        }
      });
  }
  viewDashboard() {
    let dashboardUrl = this.accountService.getCustomId() + '/dashboard';
    this.router.navigateByUrl(dashboardUrl);
  }

  goToCart() {
    this.router.navigate([this.accountService.getCustomId(), 'cart'])
  }
}

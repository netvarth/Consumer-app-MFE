import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService, GroupStorageService, LocalStorageService, OrderService, SharedService, SubscriptionService, ThemeService } from 'jconsumer-shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{

 @ViewChild('header') headerElement!: ElementRef;
  theme:string = '';
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
  constructor(    
    private orderService: OrderService,
    private sharedService: SharedService,
    private lStorageService: LocalStorageService,
    private accountService: AccountService,
    private router: Router,
    private groupService: GroupStorageService,
    private subscriptionService: SubscriptionService,
    private themeService: ThemeService
  ) {
    this.onResize();
    let account = this.sharedService.getAccountInfo();
    this.accountId = this.sharedService.getAccountID();
    console.log("Account ID :", this.accountId);
    this.locations = this.sharedService.getJson(account['location']);
    console.log("Locations:", this.locations);
    alert(this.accountId)
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
    if(this.accountService.getStores().length == 0) {
      this.getStores();
    }  
    this.orderService.getRequireOTPForAddingToCart('SALES_ORDER', this.accountId).subscribe((data: any) => {
      if (data) {
        this.isSessionCart = data.requireOTPForAddingToCart;
        this.lStorageService.setitemonLocalStorage('isSessionCart', this.isSessionCart)
        console.log("this.isSessionCart", this.isSessionCart)
      }
    })
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
    setTimeout(() => {
      this.updateHeaderHeight();
    }, 750);
  }

  getStores() {   
    this.loading = true;
    let filter = {};
    filter['accountId-eq'] = this.accountId;
    filter['onlineOrder-eq'] = true;
    filter['status-eq'] = 'Active';
    this.orderService.getStores(filter).subscribe((stores: any) => {
      if(stores && stores.length > 0) {
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
      if(!this.isSessionCart) {
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
}

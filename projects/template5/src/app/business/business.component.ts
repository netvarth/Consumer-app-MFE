import { Component, HostListener, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { projectConstantsLocal } from "jaldee-framework/constants";
import { LocalStorageService } from "jaldee-framework/storage/local";
import { Subscription } from "rxjs";
import { SubSink } from "subsink";
import { AccountService } from "../services/account-service";
import { AuthService } from "../services/auth-service";
import { OrderService } from "../services/order.service";
import { GroupStorageService } from "jaldee-framework/storage/group";
import { ConsumerService } from "../services/consumer-service";

@Component({
  'selector': 'app-business',
  templateUrl: './business.component.html',
  styleUrls:['./business.component.scss']
})
export class BusinessComponent implements OnInit {
  account: any;
  accountConfig: any;
  theme: any;
  accountId: string;
  customId: string;
  subscription: Subscription;
  locations: any;
  small_device_display: boolean;
  screenWidth: number;
  accountEncId: any;
  provider_id: any;
  accountExists: boolean;
  templateJson;
  private subscriptions = new SubSink();
  loading: boolean = true;
  activeUser: any;
  loginRequired = true;
  callback: any;
  languages = projectConstantsLocal.SUPPORTEDLANGUAGES;
  langselected = 'English';
  paramUniqueId: any;
  uniqueId: any;
  loginBackground: any;
  alignClass;
  customClass: any;
  isClickedOnce: boolean;
  loggedIn: boolean = false;
  isSessionCart: any;
  cartCount: any;
  cartFooterSubscription: Subscription;
  cartCountForSessionCart: any;
  isLoggedIn: boolean = false;
  loggedUser: any;
  onlineOrder: any = false;
  oneTimeQnrEnabled: boolean = false;
  onetimeQuestionnaireList: any;
  providerConsumerId: any;
  categoryType = 'SALES_ORDER';
  isPartnerLogin: boolean;
  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,    
    private groupService: GroupStorageService,  
    private consumerService: ConsumerService,
  ) {
    console.log("In Business Component");
    this.activatedRoute.queryParams.subscribe(qparams => {
      if (qparams && qparams['cl_dt']) {
        console.log(qparams['cl_dt']);
        if ((qparams['cl_dt'] == "true" || qparams['cl_dt'] == true) && !this.lStorageService.getitemfromLocalStorage('cleared')) {
          this.clearStorage();
        }
      }
      if (qparams && qparams['uid']) {
        this.accountService.setAppUniqueId(qparams['uid']);
      }
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
      if (this.lStorageService.getitemfromLocalStorage('partner')) {
        this.categoryType = 'LAB_SYNC';
        this.isPartnerLogin = true;
      }

    });
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.onResize();
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 767) {
    } else {
      this.small_device_display = false;
    }
    if (this.screenWidth <= 1040) {
      this.small_device_display = true;
    } else {
      this.small_device_display = false;
    }
  }
  ngOnInit() {
    const _this = this;
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    let accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = accountProfile.id;
    this.accountEncId = accountProfile.accountEncId;   
    if (_this.accountConfig) {
      if (_this.accountConfig['theme']) {
        _this.theme = this.accountConfig['theme'];
      }
      _this.authService.goThroughLogin().then((status: any) => {
        if (_this.accountConfig['loginRequired'] && !status) {
          _this.loginRequired = true;
          if (_this.accountConfig['login'] && _this.accountConfig['login']['backgroundImage']) {
            _this.loginBackground =_this.accountConfig['login']['backgroundImage'];
          }
          if (_this.accountConfig['login'] && _this.accountConfig['login']['align']) {
            _this.alignClass =_this.accountConfig['login']['align'];
          }
          if (_this.accountConfig['login'] && _this.accountConfig['login']['className']) {
            _this.customClass =_this.accountConfig['login']['className'];
          }

        } else {
          _this.loginRequired = false;
        }
        // if (_this.accountConfig['oneTimeQnrEnabled']) { 
        //   _this.oneTimeQnrEnabled = true;
        // }
        // else {
        //   _this.oneTimeQnrEnabled = false;
        // }
      })
    }
    this.templateJson = this.accountService.getTemplateJson();
    console.log("this.templateJson", this.templateJson)
    this.locations = this.accountService.getJson(this.account['location']);
    if(!this.isPartnerLogin) {
      this.getStores();
    } 
    this.orderService.getRequireOTPForAddingToCart(this.categoryType ,this.accountId).subscribe((data: any) => {
      if (data) {
        this.isSessionCart = data.requireOTPForAddingToCart;
        this.lStorageService.setitemonLocalStorage('isSessionCart', this.isSessionCart)
        console.log("this.isSessionCart", this.isSessionCart)
      }
    })
  }
  /**
 * Unsubscribe all subscriptions
 */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  clearStorage() {
    this.lStorageService.clearAll();
    this.lStorageService.setitemonLocalStorage('cleared', true);
  }
  dashboardClicked() {
    const _this = this;
    _this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          this.viewDashboard();
        } else {
          let dashboardUrl = this.customId + '/dashboard';
          this.lStorageService.setitemonLocalStorage('target', dashboardUrl);
          this.router.navigate([this.customId, 'login']);
        }
      });
  }
  viewDashboard() {
    let dashboardUrl = this.customId + '/dashboard';
    this.router.navigateByUrl(dashboardUrl);
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
              }
            }
          }
        )
      } else {
        _this.loginRequired = false;
      }
    } else {
      _this.loginRequired = false;
    }
  }

  oneTimeQnrActionPerformed(status) { 
    if(status) {
      this.loginRequired = false;
    }
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
        this.accountService.setActiveStore(stores[0]);
        this.lStorageService.setitemonLocalStorage('storeId', stores[0].id);
        this.lStorageService.setitemonLocalStorage('storeEncId', stores[0].encId);
        this.onlineOrder = stores[0].onlineOrder;
        this.lStorageService.setitemonLocalStorage('onlineOrder', stores[0].onlineOrder);
      }      
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  getOneTimeInfo(providerConsumerID, accountId) {
    const _this = this;
    console.log("Get one time info:", providerConsumerID);
    return new Promise(function (resolve, reject) {
        _this.consumerService.getProviderCustomerOnetimeInfo(providerConsumerID, accountId).subscribe(
            (questions) => {
                resolve(questions);
            }, () => {
                resolve(false);
            }
        )
    })
  }
}

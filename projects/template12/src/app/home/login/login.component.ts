import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ErrorMessagingService, GroupStorageService, LocalStorageService, OrderService, SharedService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { interval as observableInterval, Subscription } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { TranslateService } from '@ngx-translate/core';
import { IntlTelInputLoaderService } from '../../shared/intl-tel-input-loader.service';
declare var google;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewChecked {
  theme: any;
  loading = false;
  imgPath: any;
  step: any = 1; //
  account: any;
  accountConfig: any;
  loginCoverUrl: string;
  target: any; //Proceed to this target after login 
  phoneError: any;
  phoneNumber: any;
  isLogin = true;
  dialCode: any;
  otpSuccessMessage = 'OTP has been sent successfully';
  preferredCountries = ['in', 'uk', 'us'];
  separateDialCode = true;
  otpError: string = '';
  otpSuccess: string = '';
  config = {
    allowNumbersOnly: true,
    length: 4,
    inputStyles: {
      'width': '40px',
      'height': '40px'
    }
  };
  otpEntered: any;
  btnClicked = false;
  firstName: string = '';
  lastName: string = '';
  emailId: string = '';
  email: any;
  googleLogin!: boolean;
  private gisLoaded = false;
  private googleButtonResizeObserver?: ResizeObserver;
  private readonly googleButtonNewOpts = {
    theme: 'outline',
    size: 'large',
    shape: 'rectangular',
    width: 370,
    logo_alignment: 'center' as const,
    text: 'signin_with'
  };
  @ViewChild('googleBtn') googleButton!: ElementRef;
  notifyEmail = false;
  templateConfig: any;
  resetCounterVal: number = 0;
  refreshTime = 30;
  cronHandle!: Subscription;
  resend_otp_opt_active_cap = 'Resend OTP option will be active in';
  seconds_cap = 'seconds'
  title = 'Mr.';
  textLabels = {
    mainLabel: null,
    codePlaceholder: 'Code',
    searchPlaceholderLabel: 'Search',
    noEntriesFoundLabel: 'No countries found',
    nationalNumberLabel: null,
    hintLabel: null,
    invalidNumberError: 'Number is not valid',
    requiredError: 'This field is required'
  }
  isSessionCart: any;
  cartData: any;
  loggedUser: any;
  items: any;
  storeEncId: any;
  deliveryType: any;
  channel = 'SMS'
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private lStorageService: LocalStorageService,
    private renderer: Renderer2,
    private toastService: ToastService,
    private sharedService: SharedService,
    public intlTelInputLoader: IntlTelInputLoaderService,
    public translate: TranslateService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private groupService: GroupStorageService,
    private errorService: ErrorMessagingService,
    private orderService: OrderService,
    private location: Location
  ) {
    this.storeEncId = this.lStorageService.getitemfromLocalStorage('storeEncId')
    this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart')
    this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        console.log("Query Params:", queryParams);
        if (queryParams.target) {
          this.target = queryParams.target;
        }
        if (queryParams['src']) {
          this.lStorageService.setitemonLocalStorage('source', queryParams['src']);
          this.lStorageService.setitemonLocalStorage('reqFrom', 'CUSTOM_WEBSITE');
        }
      }
    )
    this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
  }
  ngOnInit() {
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('logout');
    this.templateConfig = this.sharedService.getTemplateJSON();
    if (!this.accountConfig) {
      this.accountConfig = this.sharedService.getAccountConfig();
    }
    console.log("this.templateConfig", this.templateConfig)
    if (this.accountConfig && this.accountConfig['imagePath'] && this.accountConfig['imagePath']['login']) {
      _this.imgPath = this.accountConfig['imagePath']['login'];
    }
    this.loginCoverUrl = this.accountConfig?.login?.loginBackCover
      || this.accountConfig?.loginBackCover
      || this.templateConfig?.login?.loginBackCover
      || this.templateConfig?.loginBackCover
      || this.imgPath
      || null;
    if (this.templateConfig && this.templateConfig.theme) {
      this.theme = this.templateConfig.theme;
    }
    this.initGoogleButton();
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.performAction();
        } else {
          _this.loading = false;
          this.subscriptionService.sendMessage({ ttype: 'refresh' });
          this.subscriptionService.sendMessage({ ttype: 'hideBookingsAndLocations' });
        }
      }
    )
    this.resetCounter(this.refreshTime);
    this.cronHandle = observableInterval(1000).subscribe(() => {
      if (this.resetCounterVal > 0) {
        this.resetCounterVal = this.resetCounterVal - 1;
      }
      // this.reloadAPIs();
    });
  }
  ngOnDestroy() {
    if (this.cronHandle) {
      this.cronHandle.unsubscribe();
    }
    if (this.googleButtonResizeObserver) {
      this.googleButtonResizeObserver.disconnect();
      this.googleButtonResizeObserver = undefined;
    }
  }

  resetCounter(val: number) {
    this.resetCounterVal = val;
  }
  goToDashboard() {
    let customId = this.sharedService.getCustomID();
    let dashboardUrl = customId + '/dashboard';
    this.router.navigateByUrl(dashboardUrl);
  }
  /**
   * Google Integration Code
   */
  initGoogleButton() {
    this.loadGoogleOnce().then(() => {
      google.accounts.id.initialize({
        client_id: "906354236471-jdan9m82qtls09iahte8egdffvvhl5pv.apps.googleusercontent.com",
        callback: (token: any) => {
          this.handleCredentialResponse(token);
        }
      });
      this.setupResponsiveGoogleButton();
    });
  }

  ngAfterViewChecked() {
    if (!this.gisLoaded && !window['google']?.accounts?.id) {
      return;
    }
    this.setupResponsiveGoogleButton();
  }

  private loadGoogleOnce(): Promise<void> {
    return new Promise((resolve) => {
      if (window['google']?.accounts?.id) {
        this.gisLoaded = true;
        return resolve();
      }
      const url = "https://accounts.google.com/gsi/client";
      const script = this.renderer.createElement('script');
      script.src = url;
      script.defer = true;
      script.async = true;
      script.onload = () => {
        this.gisLoaded = true;
        resolve();
      };
      this.renderer.appendChild(document.body, script);
    });
  }
  handleCredentialResponse(responseOrToken: any) {
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('authorization');
    this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
    this.lStorageService.removeitemfromLocalStorage('googleToken');
    const token = typeof responseOrToken === 'string' ? responseOrToken : responseOrToken?.credential;
    if (!token) {
      this.toastService.showError('Google token missing');
      return;
    }
    console.log(responseOrToken);
    this.googleLogin = true;
    const payLoad: any = jwtDecode(token);
    console.log(payLoad);
    _this.lStorageService.setitemonLocalStorage('googleToken', 'googleToken-' + token);
    const credentials: any = {
      accountId: _this.sharedService.getAccountID()
    }
    credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
    _this.authService.login(credentials).then((response) => {
      console.log("Login Response:", response);
      // _this.ngZone.run(
      //   () => {
      _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
      _this.performAction();
      // }
      // )
    }, (error: any) => {
      if (error.status === 401 && error.error === 'Session Already Exist') {
        const activeUser = _this.lStorageService.getitemfromLocalStorage('jld_scon');
        if (!activeUser) {
          console.log("55557");
          _this.authService.doLogout().then(
            () => {
              _this.authService.login(credentials).then(() => {
                // _this.ngZone.run(
                //   () => {
                _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
                _this.lStorageService.removeitemfromLocalStorage('googleToken');
                _this.performAction();
                //   }
                // )
              });
            }
          )
        } else {
          _this.performAction();
        }
      } else if (error.status === 401) {
        let names = payLoad['name'].split(' ');
        _this.firstName = names[0];
        _this.lastName = names[1];
        _this.email = payLoad['email'];
        // _this.ngZone.run(
        //   () => {
        _this.step = 2;
        //   }
        // )
        // this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        // this.goBack();
        // this.loading = false;

      }
    });
  }

  private setupResponsiveGoogleButton() {
    if (!this.googleButton?.nativeElement || !window['google']?.accounts?.id) {
      return;
    }
    if (this.googleButtonResizeObserver) {
      return;
    }
    const targetDrive = this.googleButton?.nativeElement;
    const sourceButton = document.getElementById('targeted');
    if (!targetDrive || !sourceButton) {
      return;
    }
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const currentWidth = entry.contentRect.width;
        const safeWidth = Math.round(Math.min(Math.max(currentWidth, 200), 400));
        const options = { ...this.googleButtonNewOpts, width: safeWidth };
        this.renderGisButton(this.googleButton, options);
      }
    });
    resizeObserver.observe(sourceButton);
    this.googleButtonResizeObserver = resizeObserver;
  }

  private calculateResponsiveGoogleWidth(element: HTMLElement): number {
    const container = element.parentElement || element;
    const availableWidth = container?.getBoundingClientRect().width || element.getBoundingClientRect().width;
    const fallbackWidth = 240;
    if (!availableWidth || Number.isNaN(availableWidth)) {
      return fallbackWidth;
    }
    const minWidth = 200;
    const maxWidth = 400;
    return Math.round(Math.min(Math.max(availableWidth, minWidth), maxWidth));
  }

  private renderGisButton(target: ElementRef<HTMLElement>, opts: any) {
    if (!target?.nativeElement) {
      return;
    }
    target.nativeElement.innerHTML = '';
    google.accounts.id.renderButton(target.nativeElement, opts);
  }

  /**
   * Phone Number Collection for Account Existence
   */
  sendOTP(mode?: string | undefined) {
    this.phoneError = null;
    this.btnClicked = true;
    this.lStorageService.removeitemfromLocalStorage('authorization');
    this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
    this.lStorageService.removeitemfromLocalStorage('googleToken');
    this.resetCounter(this.refreshTime);
    if (this.phoneNumber && this.phoneNumber.dialCode === '+91') {
      this.dialCode = this.phoneNumber.dialCode;
      const pN = this.phoneNumber.e164Number.trim();
      let loginId = pN;
      if (pN.startsWith(this.dialCode)) {
        loginId = pN.split(this.dialCode)[1];
        if (loginId.startsWith('55')) {
          this.config.length = 5;
        }
      }
      this.performSendOTP(loginId, null, mode);
    } else if (this.phoneNumber && this.phoneNumber.dialCode !== '+91') {
      this.dialCode = this.phoneNumber.dialCode;
      const pN = this.phoneNumber.e164Number.trim();
      let loginId = pN.split(this.dialCode)[1];
      this.performSendOTP(loginId, this.emailId, mode);
      this.channel = 'Email'
    } else {
      this.phoneError = 'Mobile number required';
      this.btnClicked = false;
    }
  }
  validateEmail(mail: string) {
    const emailField = mail;
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(emailField) === false) {
      return false;
    }
    return true;
  }
  clearPhoneExists() {
    this.isLogin = true;
  }

  performSendOTP(loginId: any, emailId?: any, mode?: string) {
    let credentials: any = {
      countryCode: this.dialCode,
      loginId: loginId,
      accountId: this.sharedService.getAccountID()
    }
    if (this.phoneNumber && this.phoneNumber.dialCode !== '+91') {
      if (!this.isLogin) {
        if (emailId && this.validateEmail(emailId)) {
          credentials['alternateLoginId'] = emailId;
        } else {
          // this.snackbarService.openSnackBar("Invalid email", { 'panelClass': 'snackbarerror' });
          this.toastService.showError("Invalid email");
          this.btnClicked = false;
          return false;
        }
      }
    }
    this.authService.sendConsumerOTP(credentials).subscribe((response) => {
      if (!response && this.phoneNumber && this.phoneNumber.dialCode !== '+91' && !emailId) {
        this.isLogin = false;
        this.btnClicked = false;
      } else {
        this.step = 3;
        this.btnClicked = false;
        if (mode == 'resent') {
          this.toastService.showSuccess(this.otpSuccessMessage);
          // this.snackbarService.openSnackBar(this.otpSuccessMessage);
        }
      }
    }, (error) => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
      // this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      this.btnClicked = false;
    })
    return true;
  }
  /**
   * OTP Section
   */
  onOtpChange(otp: any) {
    this.otpEntered = otp;
    console.log(this.phoneNumber);
    if (this.phoneNumber) {
      const pN = this.phoneNumber.e164Number.trim();
      let phoneNumber;
      if (pN.startsWith(this.dialCode)) {
        phoneNumber = pN.split(this.dialCode)[1];
      }
      if (this.phoneNumber.dialCode === '+91' && phoneNumber.startsWith('55') && this.otpEntered.length < 5) {
        return false;
      } else if (this.otpEntered.length < 4) {
        return false;
      } else {
        // this.btnClicked = true;
        // this.verifyOTP();
      }
    }
    return true;
  }

  isOtpComplete(): boolean {
    const enteredOtp = (this.otpEntered || '').toString().trim();
    const requiredLength = Number(this.config?.length) || 4;
    return enteredOtp.length === requiredLength;
  }

  verifyOTP() {
    const _this = this;
    this.otpSuccess = '';
    this.otpError = '';
    this.loading = true;
    if (this.otpEntered === '' || this.otpEntered === undefined) {
      this.otpError = 'Invalid OTP';
    } else {
      this.authService.verifyConsumerOTP('login', this.otpEntered).subscribe(
        (response: any) => {
          this.loading = false;
          let loginId;
          const pN = this.phoneNumber.e164Number.trim();
          if (pN.startsWith(this.dialCode)) {
            loginId = pN.split(this.dialCode)[1];
          }
          if (!response.linkedToPrivateDatabase) {
            this.lStorageService.setitemonLocalStorage('c_authorizationToken', response.token);
            this.step = 2;
            this.btnClicked = false;
          } else {

            this.lStorageService.setitemonLocalStorage('c_authorizationToken', response.token);
            const credentials = {
              countryCode: this.dialCode,
              loginId: loginId,
              accountId: this.sharedService.getAccountID()
            }
            this.authService.login(credentials).then((response) => {
              console.log("Login Response:", response);
              this.btnClicked = false;
              _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
              _this.performAction();
            }, (error: any) => {
              console.log(error);
              this.btnClicked = false;
              if (error.status === 401 && error.error === 'Session Already Exist') {
                const isLoggedIn = _this.lStorageService.getitemfromLocalStorage('ynw-credentials');
                console.log(isLoggedIn);
                if (!isLoggedIn) {
                  let authToken = _this.lStorageService.getitemfromLocalStorage('c_authorizationToken');
                  console.log("55558");
                  _this.authService.doLogout().then(
                    () => {
                      this.lStorageService.setitemonLocalStorage('c_authorizationToken', authToken);
                      _this.authService.login(credentials).then(
                        () => {
                          _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
                          _this.performAction();
                        });
                    }
                  )
                } else {
                  this.btnClicked = false;
                  _this.performAction();
                }
              } else if (error.status === 401) {
                _this.btnClicked = false;
                let errorObj = _this.errorService.getApiError(error);
                _this.toastService.showError(errorObj);
                _this.loading = false;
                _this.goBack();
              }
            })
          }
        }, error => {
          let errorObj = _this.errorService.getApiError(error);
          _this.toastService.showError(errorObj);
          this.loading = false;
          this.initGoogleButton();
        }
      );
    }
  }

  performAction() {
    const _this = this;
    console.log("In Perform Action")
    let ynwUser = _this.groupService.getitemFromGroupStorage('jld_scon');
    this.subscriptionService.sendMessage({ ttype: 'refresh', value: ynwUser.providerConsumer });
    this.authService.getProviderConsumer().subscribe(
      (spConsumer: any) => {
        console.log("Ynw USer:", ynwUser);
        console.log("Spconsumer:", spConsumer);
        ynwUser['userName'] = (spConsumer.title ? (spConsumer.title + ' ') : '') + spConsumer.firstName + ' ' + (spConsumer.lastName ? (spConsumer.lastName + ' ') : '');
        ynwUser['firstName'] = spConsumer.firstName;
        ynwUser['title'] = spConsumer.title;
        ynwUser['lastName'] = spConsumer.lastName;
        ynwUser['email'] = spConsumer.email;
        ynwUser['countryCode'] = spConsumer.countryCode;
        if (spConsumer['whatsAppNum']) {
          ynwUser['whatsAppNum'] = spConsumer['whatsAppNum'];
        }
        if (spConsumer['telegramNum']) {
          ynwUser['telegramNum'] = spConsumer['telegramNum'];
        }
        _this.groupService.setitemToGroupStorage('jld_scon', ynwUser);
        const pdata = { 'ttype': 'refresh' };
        _this.authService.sendMessage(pdata);
        let target = _this.lStorageService.getitemfromLocalStorage('target');
        if (this.target) {
          target = this.target;
        }
        if (target) {
          if (!this.isSessionCart) {
            this.cartData = this.lStorageService.getitemfromLocalStorage('cartData');
            if (this.cartData && this.cartData.items && this.cartData.items.length > 0) {
              this.items = this.cartData.items;
              this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
              this.createCart().then(data => {
                this.lStorageService.removeitemfromLocalStorage('cartData')
                this.lStorageService.removeitemfromLocalStorage('deliveryType')
                this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
              })
            }
          }
          _this.lStorageService.removeitemfromLocalStorage('target');
          _this.router.navigateByUrl(target);
        } else {
          if (!this.isSessionCart) {
            this.cartData = this.lStorageService.getitemfromLocalStorage('cartData');
            if (this.cartData && this.cartData.items && this.cartData.items.length > 0) {
              this.items = this.cartData.items;
              this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
              this.createCart().then(data => {
                this.lStorageService.removeitemfromLocalStorage('cartData')
                this.lStorageService.removeitemfromLocalStorage('deliveryType')
                this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
              })
            }
          }
          this.goToDashboard();
        }
      });
  }
  goBack() {
    this.initGoogleButton();
    this.step = 1;
  }
  goBackmain() {
    this.location.back();
  }

  openLegalPage(type: 'terms' | 'privacy', event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const path = type === 'privacy' ? 'privacy-policy' : 'terms-and-conditions';
    this.router.navigate([this.sharedService.getRouteID(), path]);
  }
  onPhoneNumberChanged(updatedPhoneNumber: any) {
    console.log('Updated phone number:', updatedPhoneNumber);
    this.phoneNumber = updatedPhoneNumber;
  }
  signUpConsumer() {
    const _this = this;
    _this.phoneError = '';
    if (_this.phoneNumber) {
      _this.dialCode = _this.phoneNumber.dialCode;
      const pN = _this.phoneNumber.e164Number.trim();
      let phoneNum: any;
      if (pN.startsWith(_this.dialCode)) {
        phoneNum = pN.split(_this.dialCode)[1];
      }
      let credentials: any = {
        accountId: _this.sharedService.getAccountID(),
        userProfile: {
          title: this.title,
          firstName: _this.firstName,
          lastName: _this.lastName,
          primaryMobileNo: phoneNum,
          countryCode: _this.dialCode
        }
      }
      if (_this.lStorageService.getitemfromLocalStorage('googleToken')) {
        credentials['userProfile']['email'] = _this.email;
        _this.authService.signUp(credentials).then((response) => {
          let credentials: any = {
            accountId: _this.sharedService.getAccountID()
          }
          credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
          this.authService.login(credentials).then((response) => {
            console.log("Login Response:", response);
            // _this.ngZone.run(
            //   () => {
            _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
            _this.performAction();
            //   }
            // )
          });
        }, (error) => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        })
      } else {
        if (_this.dialCode !== '+91') {
          credentials['userProfile']['email'] = _this.emailId;
        }
        _this.authService.signUp(credentials).then((response) => {
          let credentials: any = {
            accountId: _this.sharedService.getAccountID(),
            countryCode: _this.dialCode,
            loginId: phoneNum
          }
          credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
          this.authService.login(credentials).then((response) => {
            console.log("Login Response:", response);
            // _this.ngZone.run(
            //   () => {
            _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
            _this.performAction();
            //   }
            // )
          });
        }, (error) => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        });
      }
    } else {
      _this.phoneError = 'Mobile number required';
    }
  }
  resetApiErrors() {
    this.phoneError = null;
  }

  createCart() {
    let cartInfo = {}
    cartInfo['store'] = {
      'encId': this.storeEncId
    }
    cartInfo['providerConsumer'] = {
      'id': this.loggedUser.providerConsumer
    }
    if (this.lStorageService.getitemfromLocalStorage('deliveryType')) {
      this.deliveryType = this.lStorageService.getitemfromLocalStorage('deliveryType');
    }
    cartInfo['deliveryType'] = this.deliveryType;
    cartInfo['items'] = this.items.map((item) => ({
      catalogItem: {
        encId: item.encId,
      },
      quantity: item.quantity,
    }));
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
}

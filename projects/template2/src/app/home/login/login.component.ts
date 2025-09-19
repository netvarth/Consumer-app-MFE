import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ErrorMessagingService, GroupStorageService, LocalStorageService, OrderService, SharedService, StorageService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { interval as observableInterval, Subscription } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { TranslateService } from '@ngx-translate/core';
declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  theme: any;
  loading = false;
  imgPath: any;
  step: any = 1; //
  account: any;
  accountConfig: any;
  // accountProfile: any;
  target: any; //Proceed to this target after login 
  phoneError: any;
  phoneNumber: any;
  isLogin = true;
  dialCode: any;
  otpSuccessMessage = 'OTP has been sent successfully';
  // SearchCountryField = SearchCountryField;
  // selectedCountry = CountryISO.India;
  // PhoneNumberFormat = PhoneNumberFormat;
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
  @ViewChild('googleBtn') googleButton!: ElementRef;
  notifyEmail = false;
  templateConfig: any;
  resetCounterVal: number = 0;
  refreshTime = 30;
  cronHandle!: Subscription;
  resend_otp_opt_active_cap = 'Resend OTP option will be active in';
  seconds_cap = 'seconds'
  title = 'Mr.';
  salutation: any;
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
    // private accountService: AccountService,
    private sharedService: SharedService,
    public translate: TranslateService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    // private ngZone: NgZone,
    // private snackbarService: SnackbarService,
    private groupService: GroupStorageService,
    private storageService: StorageService,
    private errorService: ErrorMessagingService,
    private orderService: OrderService
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
    this.storageService.getSalutations().then((data: any) => {
      console.log('accountStorageService123', data)
      this.salutation = data;
    });
    this.lStorageService.removeitemfromLocalStorage('logout');
    // this.account = this.accountService.getAccountInfo();
    // this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    // this.accountConfig = this.accountService.getAccountConfig();
    this.templateConfig = this.sharedService.getTemplateJSON();
    console.log("this.templateConfig", this.templateConfig)
    if (this.accountConfig && this.accountConfig['imagePath'] && this.accountConfig['imagePath']['login']) {
      _this.imgPath = this.accountConfig['imagePath']['login'];
    }
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
    const referrer = this;
    referrer.loadGoogleJS().onload = () => {
      google.accounts.id.initialize({
        client_id: "906354236471-jdan9m82qtls09iahte8egdffvvhl5pv.apps.googleusercontent.com",
        callback: (token: any) => {
          referrer.handleCredentialResponse(token);
        }
      });
      google.accounts.id.renderButton(
        referrer.googleButton.nativeElement,
        { theme: "outline", size: "large", width: "100%" }  // customization attributes
      );
      // google.accounts.id.prompt(); // also display the One Tap dialog
    };
  }

  loadGoogleJS() {
    const self = this;
    const url = "https://accounts.google.com/gsi/client";
    console.log('preparing to load...');
    let script = this.renderer.createElement('script');
    script.src = url;
    script.defer = true;
    script.async = true;
    self.renderer.appendChild(document.body, script);
    return script;
  }
  handleCredentialResponse(response: any) {
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('authorization');
    this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
    this.lStorageService.removeitemfromLocalStorage('googleToken');
    console.log(response);
    this.googleLogin = true;
    const payLoad: any = jwtDecode(response.credential);
    console.log(payLoad);
    _this.lStorageService.setitemonLocalStorage('googleToken', 'googleToken-' + response.credential);
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

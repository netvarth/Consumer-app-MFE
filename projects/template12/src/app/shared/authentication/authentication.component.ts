import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService, ErrorMessagingService, GroupStorageService, LocalStorageService, SharedService, ToastService } from 'jconsumer-shared';
import { jwtDecode } from "jwt-decode";
import { IntlTelInputLoaderService } from '../intl-tel-input-loader.service';
declare var google;
import { interval as observableInterval, Subscription } from 'rxjs';
@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit, OnDestroy {
  loading = false;
  public finalResponse;
  @ViewChild('googleBtnNew', { static: false }) googleBtnNew: ElementRef;
  private googleBtnNewResizeUnlisten?: () => void;
  private googleBtnNewResizeDebounce?: number;
  private readonly googleButtonNewOpts = {
    theme: 'outline',
    size: 'large',
    shape: 'rectangular',
    width: 370,
    logo_alignment: 'center' as const,
    text: 'signin_with'
  };
  step: any = 1; //
  api_loading;
  phoneExists;
  phoneError: string;
  phoneNumber;
  dialCode: any;
  isPhoneValid: boolean;
  firstName;
  lastName;
  emailId;
  password;
  rePassword;
  isLogin = true;
  btnClicked = false;
  @Input() accountId;
  @Input() accountConfig;
  @Output() actionPerformed = new EventEmitter<any>();
  otpError: string;
  otpSuccess: string;
  otpSuccessMessage = 'OTP has been sent successfully';
  config = {
    allowNumbersOnly: true,
    length: 4,
    inputStyles: {
      'width': '40px',
      'height': '40px'
    }
  };
  otpEntered: any;
  cdnPath: string = '';
  email: any;
  googleLogin: boolean;
  googleIntegration: boolean;
  notifyEmail = false;
  templateConfig: any;
  theme: any;
  resetCounterVal;
  refreshTime = 30;
  cronHandle: Subscription;
  resend_otp_opt_active_cap = 'Resend OTP option will be active in';
  seconds_cap = 'seconds'
  title: any;
  preferredCountries = ['in', 'uk', 'us'];
  separateDialCode = true;
  channel ='SMS'
  loginCoverUrl: string;
  cartExpanded = false;
  cartSummary = {
    count: 0,
    total: '0.00',
    itemName: '',
    itemQty: 0,
    itemPrice: '0.00',
    itemImage: '',
    hasItems: false,
    items: [] as Array<{
      name: string;
      qty: number;
      price: string;
      image: string;
    }>
  };
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
  constructor(
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private renderer: Renderer2,
    private toastService: ToastService,
    private cd: ChangeDetectorRef,
    private sharedService: SharedService,
    public intlTelInputLoader: IntlTelInputLoaderService,
    private ngZone: NgZone,
    private errorService: ErrorMessagingService,
    private location: Location
  ) {
    this.loading = true;
  }
  goBackmain() {
    this.location.back();
  }
  ngOnDestroy(): void {
    this.lStorageService.removeitemfromLocalStorage('login');
    if (this.googleBtnNewResizeUnlisten) {
      this.googleBtnNewResizeUnlisten();
      this.googleBtnNewResizeUnlisten = undefined;
    }
    if (this.googleBtnNewResizeDebounce) {
      window.clearTimeout(this.googleBtnNewResizeDebounce);
      this.googleBtnNewResizeDebounce = undefined;
    }
  }
  initGoogleButton() {
    this.loadGoogleOnce().then(() => {
      google.accounts.id.initialize({
        client_id: "906354236471-jdan9m82qtls09iahte8egdffvvhl5pv.apps.googleusercontent.com",
        callback: (token) => {
          this.handleCredentialResponse(token);
        }
      });
      this.setupResponsiveGoogleButton();
    });
  }
  ngOnInit(): void {
    this.lStorageService.removeitemfromLocalStorage('login');
    this.lStorageService.removeitemfromLocalStorage('logout');
    this.cdnPath = this.sharedService.getCDNPath();
    this.templateConfig = this.sharedService.getTemplateJSON();
    if (!this.accountConfig) {
      this.accountConfig = this.sharedService.getAccountConfig();
    }
    if (this.templateConfig && this.templateConfig.theme) {
      this.theme = this.templateConfig.theme;
    }
    this.loginCoverUrl = this.accountConfig?.login?.loginBackCover
      || this.accountConfig?.loginBackCover
      || this.templateConfig?.login?.loginBackCover
      || this.templateConfig?.loginBackCover
      || null;
    this.loadCartSummary();
    //
    if (this.accountConfig && this.accountConfig['googleIntegration'] === false) {
      this.googleIntegration = false;
    } else {
      this.googleIntegration = true;
      setTimeout(() => {
        if (this.googleIntegration && this.googleBtnNew) {
          this.initGoogleButton();
        }
      });
    }
    this.loading = false;
    this.resetCounter(this.refreshTime);
    this.cronHandle = observableInterval(1000).subscribe(() => {
      if (this.resetCounterVal > 0) {
        this.resetCounterVal = this.resetCounterVal - 1;
      }
      // this.reloadAPIs();
    });
  }
  resetCounter(val) {
    this.resetCounterVal = val;
  }

  private gisLoaded = false;

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

  toggleCart() {
    this.cartExpanded = !this.cartExpanded;
  }

  private loadCartSummary() {
    const cartData = this.lStorageService.getitemfromLocalStorage('cartData');
    if (!cartData) {
      return;
    }
    const deliveryTypes = ['HOME_DELIVERY', 'STORE_PICKUP'];
    let selectedCart = null;
    for (const type of deliveryTypes) {
      if (cartData?.[type]?.items?.length > 0) {
        selectedCart = cartData[type];
        break;
      }
    }
    const items = selectedCart?.items || [];
    if (!items.length) {
      return;
    }
    const firstItem = items[0];
    const total = selectedCart?.netTotal ?? selectedCart?.netRate ?? this.sumCartTotal(items);
    const totalQty = items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
    const summaryItems = items.map((item) => {
      const qty = Number(item?.quantity) || 0;
      const unitPrice = this.getCartItemPrice(item);
      return {
        name: this.getCartItemName(item),
        qty,
        price: this.formatAmount(unitPrice * (qty || 1)),
        image: this.getCartItemImage(item)
      };
    });
    this.cartSummary = {
      count: totalQty,
      total: this.formatAmount(total),
      itemName: this.getCartItemName(firstItem),
      itemQty: Number(firstItem?.quantity) || 0,
      itemPrice: this.formatAmount(this.getCartItemPrice(firstItem)),
      itemImage: this.getCartItemImage(firstItem),
      hasItems: true,
      items: summaryItems
    };
  }

  private getCartItemName(item: any): string {
    return item?.parentItemName
      || item?.spItem?.name
      || item?.spItemDto?.name
      || item?.catalogItem?.spItem?.name
      || item?.catalogItem?.spItemDto?.name
      || item?.name
      || '';
  }

  private getCartItemImage(item: any): string {
    return item?.spItemDto?.attachments?.[0]?.s3path
      || item?.spItem?.attachments?.[0]?.s3path
      || item?.attachments?.[0]?.s3path
      || '';
  }

  private getCartItemPrice(item: any): number {
    const qty = Number(item?.quantity) || 1;
    if (item?.price) {
      return Number(item.price);
    }
    if (item?.netRate && qty) {
      return Number(item.netRate) / qty;
    }
    if (item?.netTotal && qty) {
      return Number(item.netTotal) / qty;
    }
    return 0;
  }

  private sumCartTotal(items: any[]): number {
    return items.reduce((sum, item) => {
      const qty = Number(item?.quantity) || 0;
      const unit = Number(item?.price) || (item?.netRate && qty ? Number(item.netRate) / qty : 0);
      return sum + (unit * qty);
    }, 0);
  }

  private formatAmount(value: any): string {
    const amount = Number(value) || 0;
    return amount.toFixed(2);
  }

  /**
   * Phone Number Collection for Account Existencen
   */
  sendOTP(mode?) {
    this.phoneError = null;
    this.btnClicked = true;
    this.lStorageService.removeitemfromLocalStorage('login');
    this.lStorageService.removeitemfromLocalStorage('logout');
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
      this.channel ='Email'
    } else {
      this.phoneError = 'Mobile number required';
      this.btnClicked = false;
    }
  }
  validateEmail(mail) {
    const emailField = mail;
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(emailField) === false) {
      return false;
    }
    return true;
  }
  performSendOTP(loginId, emailId?, mode?) {
    console.log("Perform Send OTP");
    let credentials = {
      countryCode: this.dialCode,
      loginId: loginId,
      accountId: this.accountId
    }

    if (this.phoneNumber && this.phoneNumber.dialCode !== '+91') {
      if (!this.isLogin) {
        if (emailId && this.validateEmail(emailId)) {
          credentials['alternateLoginId'] = emailId;
        } else {
          this.toastService.showError("Invalid email");
          // this.snackbarService.openSnackBar("Invalid email", { 'panelClass': 'snackbarerror' });
          this.btnClicked = false;
          return false;
        }
      }
    }
    this.authService.sendConsumerOTP(credentials).subscribe(
      (response: any) => {
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
        this.btnClicked = false;

      }
    )
    return true;
  }
  resetApiErrors() {
    this.phoneError = null;
  }
  clearPhoneExists() {
    this.phoneExists = false;
    this.isLogin = true;
  }
  onOtpSubmit(otp) {
  }
  goBack() {
    setTimeout(() => {
      if (this.googleIntegration && this.googleBtnNew) {
        this.initGoogleButton();
      }
    });
    this.step = 1;
  }
  signUpConsumer() {
    const _this = this;
    _this.phoneError = '';
    if (_this.phoneNumber) {
      _this.dialCode = _this.phoneNumber.dialCode;
      const pN = _this.phoneNumber.e164Number.trim();
      let phoneNum;
      if (pN.startsWith(_this.dialCode)) {
        phoneNum = pN.split(_this.dialCode)[1];
      }
      let credentials = {
        accountId: _this.accountId,
        userProfile: {
          title: _this.title,
          firstName: _this.firstName,
          lastName: _this.lastName,
          primaryMobileNo: phoneNum,
          countryCode: _this.dialCode
        }
      }
      if (_this.lStorageService.getitemfromLocalStorage('googleToken')) {
        credentials['userProfile']['email'] = _this.email;
        _this.authService.signUp(credentials).then((response) => {
          let credentials = {
            accountId: _this.accountId
          }
          _this.authService.login(credentials).then(
            () => {
              _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
              _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
              _this.lStorageService.removeitemfromLocalStorage('googleToken');
              _this.ngZone.run(() => {
                _this.setProviderConsumer().then(
                  () => {
                    _this.actionPerformed.emit('success');
                    _this.cd.detectChanges();
                  }
                );
              });
            }, (error) => {
              let errorObj = this.errorService.getApiError(error);
              this.toastService.showError(errorObj);
            });
          console.log("Signup Success:", response);
        }, (error) => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        })
      } else {
        if (_this.dialCode !== '+91') {
          credentials['userProfile']['email'] = _this.emailId;
        }
        _this.authService.signUp(credentials).then((response) => {
          let credentials = {
            accountId: _this.accountId,
            countryCode: _this.dialCode,
            loginId: phoneNum
          }
          _this.authService.login(credentials).then((response) => {
            _this.authService.setLoginData(response, credentials);
            console.log("Login Response:", response);
            _this.ngZone.run(() => {
              _this.setProviderConsumer().then(
                () => {
                  _this.actionPerformed.emit('success');
                  _this.cd.detectChanges();
                }
              );

            });
          }, (error) => {
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);;
          })
        }, (error) => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        });
      }
    } else {
      _this.phoneError = 'Mobile number required';
    }
  }

  /**
   * OTP Section
   */
  onOtpChange(otp) {
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
    this.api_loading = true;
    console.log(this.otpEntered);
    if (this.phoneNumber) {
      const pN = this.phoneNumber.e164Number.trim();
      let phoneNumber;
      if (pN.startsWith(this.dialCode)) {
        phoneNumber = pN.split(this.dialCode)[1];
      }
      if (this.phoneNumber.dialCode === '+91' && phoneNumber.startsWith('55') && this.otpEntered.length < 5) {
        // this.otpError = 'Invalid OTP';
        this.toastService.showError('Invalid OTP');
        // this.snackbarService.openSnackBar('Invalid OTP', { 'panelClass': 'snackbarerror' });
        this.api_loading = false;
        return false;
      } else if (this.otpEntered.length < 4) {
        this.toastService.showError('Invalid OTP');
        // this.snackbarService.openSnackBar('Invalid OTP', { 'panelClass': 'snackbarerror' });
        this.api_loading = false;
        // this.otpError = 'Invalid OTP';
        return false;
      }
    }
    this.api_loading = false;
    this.loading = true;
    if (this.otpEntered === '' || this.otpEntered === undefined) {
      this.otpError = 'Invalid OTP';
      this.loading = false;
    } else {
      this.authService.verifyConsumerOTP('login',this.otpEntered)
        .subscribe(
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
                accountId: this.accountId
              }
              this.authService.login(credentials).then((response) => {
                console.log("Login Response:", response);
                // const reqFrom = this.lStorageService.getitemfromLocalStorage('reqFrom');
                _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
                _this.setProviderConsumer().then(
                  () => {
                    _this.actionPerformed.emit('success');
                    this.btnClicked = false;
                  });
              }, (error: any) => {
                this.btnClicked = false;
                if (error.status === 401 && error.error === 'Session Already Exist') {
                  const activeUser = _this.lStorageService.getitemfromLocalStorage('jld_scon');
                  if (!activeUser) {
                    _this.authService.doLogout().then(
                      () => {
                        _this.lStorageService.removeitemfromLocalStorage('logout');
                        _this.authService.login(credentials).then(
                          () => {
                            _this.ngZone.run(
                              () => {
                                _this.setProviderConsumer().then(
                                  () => {
                                    _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
                                    _this.actionPerformed.emit('success');
                                  }
                                );

                              }
                            )
                          });
                      }
                    )
                  } else {
                    _this.authService.doLogout().then(
                      () => {
                        _this.actionPerformed.emit('success');
                        this.btnClicked = false;
                      });
                  }
                } else if (error.status === 401) {
                  _this.ngZone.run(
                    () => {
                      // _this.step = 2;
                      this.btnClicked = false;
                      let errorObj = this.errorService.getApiError(error);
                      this.toastService.showError(errorObj);
                      _this.loading = false;
                      _this.goBack();
                    }
                  )
                }
              })
            }
          },
          error => {
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);
            this.loading = false;
            this.btnClicked = false;
          }
        );
    }
    return true;
  }
  setProviderConsumer() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      setTimeout(() => {
         _this.authService.getProviderConsumer().subscribe(
        (spConsumer: any) => {
          let ynwUser = _this.groupService.getitemFromGroupStorage('jld_scon');
          console.log("Ynw USer:", ynwUser);
          console.log("Spconsumer:", spConsumer);
          ynwUser['userName'] = (spConsumer.title ? (spConsumer.title + ' ') : '') + spConsumer.firstName + ' ' + (spConsumer.lastName ? (spConsumer.lastName + ' ') : '');
          ynwUser['firstName'] = spConsumer.firstName;
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
          resolve(true);
        });
      }, 100);
    })
  }
  handleCredentialResponse(responseOrToken: any) {
    const _this = this;
    const token = typeof responseOrToken === 'string' ? responseOrToken : responseOrToken?.credential;
    if (!token) {
      this.toastService.showError('Google token missing');
      return;
    }
    this.lStorageService.removeitemfromLocalStorage('googleToken');
    this.googleLogin = true;
    const payLoad = jwtDecode(token);
    _this.lStorageService.setitemonLocalStorage('googleToken', 'googleToken-' + token);
    const credentials = {
      accountId: _this.accountId
    }
    credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
    _this.authService.login(credentials).then((response) => {
      console.log("Login Response:", response);
      _this.ngZone.run(
        () => {
          _this.lStorageService.removeitemfromLocalStorage('googleToken');
          _this.setProviderConsumer().then(
            () => {
              _this.actionPerformed.emit('success');
            })
        }
      )
    }, (error: any) => {
      if (error.status === 401 && error.error === 'Session Already Exist') {
        const activeUser = _this.lStorageService.getitemfromLocalStorage('jld_scon');
        if (!activeUser) {
          _this.authService.doLogout().then(
            () => {
              _this.lStorageService.removeitemfromLocalStorage('logout');
              _this.authService.login(credentials).then(
                () => {
                  _this.ngZone.run(
                    () => {
                      _this.setProviderConsumer().then(
                        () => {
                          _this.lStorageService.removeitemfromLocalStorage('googleToken');
                          _this.actionPerformed.emit('success');
                        })
                    }
                  )
                });
            }
          )
        } else {
          _this.actionPerformed.emit('success');
        }
      } else if (error.status === 401) {
        let names = payLoad['name'].split(' ');
        _this.firstName = names[0];
        _this.lastName = names[1];
        _this.email = payLoad['email'];
        _this.ngZone.run(
          () => {
            _this.step = 2;
          }
        )
      }
    });
  }
  private setupResponsiveGoogleButton() {
    if (!this.googleBtnNew?.nativeElement) {
      return;
    }
    // this.renderGisButton(this.googleBtnNew, this.googleButtonNewOpts);
    // const renderResponsive = () => {
    //   if (!this.googleBtnNew?.nativeElement) {
    //     return;
    //   }
    //   const width = this.calculateResponsiveGoogleWidth(this.googleBtnNew.nativeElement);
    //   const options = { ...this.googleButtonNewOpts, width };
    //   this.renderGisButton(this.googleBtnNew, options);
    // };
    // renderResponsive();
    // setTimeout(renderResponsive, 0);
    // setTimeout(renderResponsive, 0);
    // if (!this.googleBtnNewResizeUnlisten) {
    //   this.googleBtnNewResizeUnlisten = this.renderer.listen('window', 'resize', () => {
    //     if (this.googleBtnNewResizeDebounce) {
    //       window.clearTimeout(this.googleBtnNewResizeDebounce);
    //     }
    //     this.googleBtnNewResizeDebounce = window.setTimeout(() => renderResponsive(), 0);
    //   });
    // }
    const targetDrive = this.googleBtnNew?.nativeElement;
    const sourceButton = document.getElementById('targeted');

  if (!targetDrive || !sourceButton) return;

  // 1. Create the observer
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      // Get the current width of your "Continue" button
      const currentWidth = entry.contentRect.width;

      // Google buttons must be between 200 and 400
      const safeWidth = Math.round(Math.min(Math.max(currentWidth, 200), 400));

      // 2. Re-render the Google button with the exact same width
      const options = { ...this.googleButtonNewOpts, width: safeWidth };
      this.renderGisButton(this.googleBtnNew, options);
    }
  });

  // 3. Start watching your "Continue" button
  resizeObserver.observe(sourceButton);
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
  onPhoneNumberChanged(updatedPhoneNumber: any) {
    this.phoneNumber = updatedPhoneNumber;
  }
  getHelp(){
    // window.location.href = 'https://support.google.com/accounts/?hl=en#topic=3382296';
    window.open('https://support.google.com/accounts/?hl=en#topic=3382296', '_blank');
  }
}

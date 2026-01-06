import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ErrorMessagingService, GroupStorageService, LocalStorageService, SharedService, ToastService } from 'jconsumer-shared';
import { jwtDecode } from "jwt-decode";
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
  @ViewChild('googleBtn') googleButton: ElementRef;
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
  @ViewChild('googleBtn', { static: false }) googleBtn!: ElementRef<HTMLDivElement>;
  private googleBtnResizeUnlisten?: () => void;
  @Input() accountId;
  @Input() accountConfig;
  private googleBtnResizeDebounce?: number;
  accountConfiguration: any;

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
  email: any;
  googleLogin: boolean;
  googleIntegration: boolean;
  notifyEmail = false;
  templateConfig: any;
  theme: any;
  resetCounterVal;
  refreshTime = 30;
  cronHandle: Subscription;
  heading = "Let's Start";
  subHeading = "";
  alignClass: any;
  resend_otp_opt_active_cap = 'Resend OTP option will be active in';
  seconds_cap = 'seconds'
  title: any;
  preferredCountries = ['in', 'uk', 'us'];
  separateDialCode = true;
  channel = 'SMS'
  google_loading = false;

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
  private readonly googleButtonNewOpts = {
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    logo_alignment: 'center' as const,
    text: 'signin_with'
  };
  gisLoaded: boolean;
  cdnPath: string = '';
  isIOSApp: Boolean;
  constructor(
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private renderer: Renderer2,
    private toastService: ToastService,
    private cd: ChangeDetectorRef,
    private sharedService: SharedService,
    private ngZone: NgZone,
    private errorService: ErrorMessagingService,
    private router: Router,
  ) {
    this.loading = true;
    this.cdnPath = this.sharedService.getCDNPath();
  }
  get isAndroidBridgeAvailable(): boolean {
    return !!(window as any).Android && typeof (window as any).Android.signInWithGoogle === 'function';
  }
  ngOnDestroy(): void {
    this.lStorageService.removeitemfromLocalStorage('login');
  }
  // initGoogleButton() {
  //   console.log("Google Login Button:", this.googleButton);
  //   setTimeout(() => {
  //     if (this.googleButton && this.googleButton.nativeElement) {
  //       const referrer = this;
  //       referrer.loadGoogleJS().onload = () => {
  //         google.accounts.id.initialize({
  //           client_id: "906354236471-jdan9m82qtls09iahte8egdffvvhl5pv.apps.googleusercontent.com",
  //           callback: (token) => {
  //             referrer.handleCredentialResponse(token);
  //           }
  //         });
  //         google.accounts.id.renderButton(
  //           referrer.googleButton.nativeElement,
  //           { theme: "outline", size: "large", width: "100%" }  // customization attributes
  //         );
  //         // google.accounts.id.prompt(); // also display the One Tap dialog
  //       };
  //     }
  //   }, 100);
  // }

  setLoginProperties() {
    if (this.accountConfiguration && this.accountConfiguration['login']) {
      if (this.accountConfiguration['login']['heading']) {
        this.heading = this.accountConfiguration['login']['heading'];
      }
      if (this.accountConfiguration['login']['subHeading']) {
        this.subHeading = this.accountConfiguration['login']['subHeading'];
      }
      if (this.accountConfiguration['login']['align']) {
        this.alignClass = this.accountConfiguration['login']['align'];
      }

    }
  }


  ngOnInit(): void {

    this.isIOSApp = this.lStorageService.getitemfromLocalStorage('ios');
    console.log('isIOS app : ' + this.isIOSApp);
    this.accountId = this.sharedService.getAccountID();
    this.lStorageService.removeitemfromLocalStorage('login');
    this.lStorageService.removeitemfromLocalStorage('logout');
    this.templateConfig = this.sharedService.getTemplateJSON();
    if (this.templateConfig && this.templateConfig.theme) {
      this.theme = this.templateConfig.theme;
    }

    this.accountConfiguration = this.sharedService.getAccountConfig();
    this.setLoginProperties();

    // console.log("Account Configuration:", this.accountConfiguration);
    if (this.accountConfig && this.accountConfig['googleIntegration'] === false) {
      this.googleIntegration = false;
    } else {
      this.googleIntegration = true;
      if (this.googleIntegration && !this.isAndroidBridgeAvailable) {
        // Render after Angular finishes the first pass; handles *ngIf async DOM
        setTimeout(() => {
          this.initGoogleButton();
        });
      }
    }
    this.loading = false;
    this.resetCounter(this.refreshTime);
    this.cronHandle = observableInterval(1000).subscribe(() => {
      if (this.resetCounterVal > 0) {
        this.resetCounterVal = this.resetCounterVal - 1;
      }
      // this.reloadAPIs();
    });


    const w: any = window as any;

    w.__onNativeGoogleIdToken = async (idToken: string) => {
      //alert('Google ID Token received successfully' + idToken.substring(0, 20) + '...');

      try {
        // Call your backend: exchange token → create session/JWT
        //await this.http.post('/api/auth/google', { idToken }).toPromise();
        await this.handleCredentialResponse(idToken);

        // Navigate
        this.router.navigateByUrl('/home');
      } catch (err) {
        console.error(err);
        // show toast: "Google login failed"
      } finally {
        this.google_loading = false;
        this.btnClicked = false;
      }
    };

    w.__onNativeGoogleSignInError = (msg: string) => {
      console.error(msg);
      // show toast: msg
      this.google_loading = false;
      this.btnClicked = false;
    };

  }
  resetCounter(val) {
    this.resetCounterVal = val;
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
      this.channel = 'Email'
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
    this.step = 1;
    console.log("Go Back to Step 1");
    setTimeout(() => {
      if (this.googleIntegration && !this.isAndroidBridgeAvailable) {
        this.initGoogleButton();
      }
    });
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
      credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
      credentials['deviceType'] = this.lStorageService.getitemfromLocalStorage('mode') ? 'IOS' : 'ANDROID';
      if (this.lStorageService.getitemfromLocalStorage('appId')) {
        credentials['appId'] = this.lStorageService.getitemfromLocalStorage('appId');
      }

      if (_this.lStorageService.getitemfromLocalStorage('googleToken')) {
        credentials['userProfile']['email'] = _this.email;
        _this.authService.signUp(credentials).then((response) => {
          let credentials = {
            accountId: _this.accountId
          }
          _this.authService.consumerLogin(credentials).then(
            () => {
              const token = _this.lStorageService.getitemfromLocalStorage('c_authorizationToken');
              _this.lStorageService.setitemonLocalStorage('refreshToken', token);
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
          _this.authService.consumerLogin(credentials).then((response) => {

            _this.authService.setLoginData(response, credentials);
            const token = _this.lStorageService.getitemfromLocalStorage('c_authorizationToken');
            _this.lStorageService.setitemonLocalStorage('refreshToken', token);
            _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
            console.log("Login Response:", response);
            _this.setProviderConsumer().then(
              () => {
                _this.actionPerformed.emit('success');
                _this.cd.detectChanges();
              }
            );
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
      this.authService.verifyConsumerOTP('login', this.otpEntered)
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
              credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
              credentials['deviceType'] = this.lStorageService.getitemfromLocalStorage('mode') ? 'IOS' : 'ANDROID';
              if (this.lStorageService.getitemfromLocalStorage('appId')) {
                credentials['appId'] = this.lStorageService.getitemfromLocalStorage('appId');
              }
              const token = _this.lStorageService.getitemfromLocalStorage('c_authorizationToken');

              this.authService.consumerLogin(credentials).then((loginResponse: any) => {
                console.log("Login Response1:", loginResponse);
                const token = _this.lStorageService.getitemfromLocalStorage('c_authorizationToken');
                _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
                _this.setProviderConsumer().then(
                  () => {
                    _this.actionPerformed.emit('success');
                    this.btnClicked = false;
                  });
              }, (error: any) => {
                this.btnClicked = false;
                console.log("Error in Login After OTP:", error);
                if (error.status === 401 && error.error === 'Session Already Exist') {
                  const activeUser = _this.lStorageService.getitemfromLocalStorage('jld_scon');
                  if (!activeUser) {
                    _this.authService.doLogout().then(
                      () => {
                        console.log("401 DoLogout");
                        _this.lStorageService.setitemonLocalStorage('c_authorizationToken', token);
                        _this.lStorageService.removeitemfromLocalStorage('logout');
                        _this.authService.consumerLogin(credentials).then(
                          (loginResponse) => {
                            console.log("Login Response2:", loginResponse);
                            const token = _this.lStorageService.getitemfromLocalStorage('c_authorizationToken');
                            _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                            _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
                            _this.setProviderConsumer().then(
                              () => {
                                _this.actionPerformed.emit('success');
                              }
                            );
                          });
                      }
                    )
                  } else {
                    _this.authService.doLogout().then(
                      () => {
                        console.log("logout 2");
                        _this.actionPerformed.emit('success');
                        this.btnClicked = false;
                      });
                  }
                } else if (error.status === 401) {
                  // _this.ngZone.run(
                  //   () => {
                  // _this.step = 2;
                  console.log("401 Error");
                  this.btnClicked = false;
                  let errorObj = this.errorService.getApiError(error);
                  this.toastService.showError(errorObj);
                  _this.loading = false;
                  _this.goBack();
                }
                //   )
                // }
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
  handleCredentialResponse(tokenOrObj: any) {
    // ✅ Normalize to ID token string
    const idToken: string =
      typeof tokenOrObj === 'string'
        ? tokenOrObj
        : (tokenOrObj?.credential || tokenOrObj?.idToken || '');

    if (!idToken) {
      console.error('No idToken found in handleCredentialResponse()', tokenOrObj);
      alert('Google token missing');
      this.google_loading = false;
      this.btnClicked = false;
      return;
    }
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('googleToken');
    console.log(tokenOrObj);
    console.log(idToken);

    this.googleLogin = true;
    const payLoad = jwtDecode(idToken);
    console.log(payLoad);
    _this.lStorageService.setitemonLocalStorage('googleToken', 'googleToken-' + idToken);
    const credentials = {
      accountId: _this.accountId
    }
    credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
    credentials['deviceType'] = this.lStorageService.getitemfromLocalStorage('mode') ? 'IOS' : 'ANDROID';
    if (this.lStorageService.getitemfromLocalStorage('appId')) {
      credentials['appId'] = this.lStorageService.getitemfromLocalStorage('appId');
    }
    _this.authService.consumerLogin(credentials).then((response: any) => {
      _this.lStorageService.setitemonLocalStorage('refreshToken', response.token);
      console.log("Login Response:", response);
      _this.lStorageService.removeitemfromLocalStorage('googleToken');
      _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
      _this.setProviderConsumer().then(
        () => {
          _this.actionPerformed.emit('success');
        })
    }, (error: any) => {
      if (error.status === 401 && error.error === 'Session Already Exist') {
        const activeUser = _this.lStorageService.getitemfromLocalStorage('jld_scon');
        if (!activeUser) {
          _this.authService.doLogout().then(
            () => {
              console.log("logout 3");
              _this.lStorageService.removeitemfromLocalStorage('logout');
              _this.authService.consumerLogin(credentials).then(
                (response: any) => {
                  _this.lStorageService.setitemonLocalStorage('refreshToken', response.token);
                  _this.lStorageService.removeitemfromLocalStorage('googleToken');
                  _this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
                  _this.setProviderConsumer().then(
                    () => {
                      _this.actionPerformed.emit('success');
                    })
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
  onPhoneNumberChanged(updatedPhoneNumber: any) {
    this.phoneNumber = updatedPhoneNumber;
  }
  private loadGoogleOnce(): Promise<void> {
    return new Promise((resolve) => {
      if (window['google']?.accounts?.id) { this.gisLoaded = true; return resolve(); }
      const url = 'https://accounts.google.com/gsi/client';
      const script = this.renderer.createElement('script');
      script.src = url; script.async = true; script.defer = true;
      script.onload = () => { this.gisLoaded = true; resolve(); };
      this.renderer.appendChild(document.body, script);
    });
  }
  private setupResponsiveGoogleButton() {
    if (!this.googleBtn?.nativeElement) {
      return;
    }
    const renderResponsive = () => {
      if (!this.googleBtn?.nativeElement) {
        return;
      }
      const width = this.calculateResponsiveGoogleWidth(this.googleBtn.nativeElement);
      const options = { ...this.googleButtonNewOpts, width };
      this.renderGisButton(this.googleBtn, options);
    };
    renderResponsive();
    setTimeout(renderResponsive, 0);
    setTimeout(renderResponsive, 0);
    if (!this.googleBtnResizeUnlisten) {
      this.googleBtnResizeUnlisten = this.renderer.listen('window', 'resize', () => {
        if (this.googleBtnResizeDebounce) {
          window.clearTimeout(this.googleBtnResizeDebounce);
        }
        this.googleBtnResizeDebounce = window.setTimeout(() => renderResponsive(), 0);
      });
    }
  }
  private calculateResponsiveGoogleWidth(element: HTMLElement): number {
    const container = element.parentElement || element;
    const availableWidth = container?.getBoundingClientRect().width || element.getBoundingClientRect().width;
    const fallbackWidth = 240;
    if (!availableWidth || Number.isNaN(availableWidth)) {
      return fallbackWidth;
    }
    const minWidth = 120;
    const maxWidth = 400;
    return Math.round(Math.min(Math.max(availableWidth, minWidth), maxWidth));
  }
  private renderGisButton(target: ElementRef<HTMLElement>, opts: any) {
    if (!target?.nativeElement) return;
    target.nativeElement.innerHTML = '';
    google.accounts.id.renderButton(target.nativeElement, opts);
  }

  initGoogleButton() {
    this.loadGoogleOnce().then(() => {
      google.accounts.id.initialize({
        client_id: "906354236471-jdan9m82qtls09iahte8egdffvvhl5pv.apps.googleusercontent.com",
        callback: (token: any) => this.handleCredentialResponse(token),
        itp_support: true
      });
      this.setupResponsiveGoogleButton();
    });
  }
  onNativeGoogleClick() {
    if (this.btnClicked || this.google_loading) return;

    this.btnClicked = true;
    this.google_loading = true;

    try {
      // Call Android bridge (WebView)
      const w: any = window as any;

      if (this.isAndroidBridgeAvailable) {
        w.Android.signInWithGoogle();
      } else {
        // Not running inside Android WebView
        this.google_loading = false;
        this.btnClicked = false;
        console.info('Android bridge not available');
      }
    } catch (e) {
      this.google_loading = false;
      this.btnClicked = false;
      console.error(e);
    }
  }
}

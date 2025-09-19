import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { AuthService, ErrorMessagingService, GroupStorageService, LocalStorageService, SharedService, StorageService, ToastService } from 'jconsumer-shared';
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
  salutation: any;
  title: any;
  preferredCountries = ['in', 'uk', 'us'];
  separateDialCode = true;
  channel ='SMS'
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
    private ngZone: NgZone,
    private storageService: StorageService,
    private errorService: ErrorMessagingService
  ) {
    this.loading = true;
  }
  ngOnDestroy(): void {
    this.lStorageService.removeitemfromLocalStorage('login');
  }
  initGoogleButton() {
    console.log("Google Login Button:", this.googleButton);
    setTimeout(() => {
      if (this.googleButton && this.googleButton.nativeElement) {
        const referrer = this;
        referrer.loadGoogleJS().onload = () => {
          google.accounts.id.initialize({
            client_id: "906354236471-jdan9m82qtls09iahte8egdffvvhl5pv.apps.googleusercontent.com",
            callback: (token) => {
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
    }, 100);
  }
  ngOnInit(): void {
    this.accountId = this.sharedService.getAccountID(); 
    this.storageService.getSalutations().then((data: any) => {
      this.salutation = data;
    });
    this.lStorageService.removeitemfromLocalStorage('login');
    this.lStorageService.removeitemfromLocalStorage('logout');
    this.templateConfig = this.sharedService.getTemplateJSON();
    if (this.templateConfig && this.templateConfig.theme) {
      this.theme = this.templateConfig.theme;
    }
    //
    if (this.accountConfig && this.accountConfig['googleIntegration'] === false) {
      this.googleIntegration = false;
    } else {
      this.googleIntegration = true;
      this.initGoogleButton();
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
    this.initGoogleButton();
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
  handleCredentialResponse(response) {
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('googleToken');
    console.log(response);
    this.googleLogin = true;
    const payLoad = jwtDecode(response.credential);
    console.log(payLoad);
    _this.lStorageService.setitemonLocalStorage('googleToken', 'googleToken-' + response.credential);
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
  onPhoneNumberChanged(updatedPhoneNumber: any) {
    this.phoneNumber = updatedPhoneNumber;
  }
}
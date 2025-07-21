import { Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import { AccountService } from '../../services/account-service';
import { AuthService } from '../../services/auth-service';
declare var google;
import jwt_decode from "jwt-decode";
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  theme;
  loading = false;
  private subscriptions = new SubSink();
  imgPath: any;
  step: any = 1; //
  account: any;
  accountConfig: any;
  accountProfile: any;
  target: any; //Proceed to this target after login 
  phoneError: string;
  phoneNumber;
  dialCode: any;
  SearchCountryField = SearchCountryField;
  selectedCountry = CountryISO.India;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedKingdom, CountryISO.UnitedStates];
  separateDialCode = true;
  otpError: string;
  otpSuccess: string;
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
  firstName;
  lastName;
  emailId;
  email: any;
  googleLogin: boolean;
  @ViewChild('googleBtn') googleButton: ElementRef;
  googleIntegration: boolean;
  accoundId: any;
  loginResponse;
  notifyEmail = false;
  emailError: string;
  isSmsEmail: boolean;
  isSms: boolean;
  isEmail: boolean;
  isLogin = true;
  salutation: any;
  title: any;
  forTest = true;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private lStorageService: LocalStorageService,
    private renderer: Renderer2,
    private accountService: AccountService,
    public translate: TranslateService,
    private authService: AuthService,
    private ngZone: NgZone,
    private snackbarService: SnackbarService,
    private storageService:StorageService,
  ) {
    this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (queryParams.target)
          this.target = queryParams.target;
      }
    )
  }
  ngOnInit() {
    const _this = this;
    this.storageService.getSalutations().then((data: any) => { 
      console.log('accountStorageService123', data) 
      this.salutation = data;
    });
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.lStorageService.removeitemfromLocalStorage('logout');
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    if(this.accountProfile && this.accountProfile.id){
      this.accoundId= this.accountProfile.id;
    }
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    if (this.accountConfig && this.accountConfig['googleIntegration'] === false) {
      this.googleIntegration = false;
    } else {
      this.googleIntegration = true;
      this.initGoogleButton();
    }
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.performAction();
        } else {
          _this.loading = false;
          this.accountService.sendMessage({ ttype: 'hideBookingsAndLocations' });
        }
      }
    )
  }
  goToDashboard() {
    let customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
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
  handleCredentialResponse(response) {
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('authorization');
    this.lStorageService.removeitemfromLocalStorage('authorizationToken');
    this.lStorageService.removeitemfromLocalStorage('googleToken');
    console.log(response);
    this.googleLogin = true;
    const payLoad = jwt_decode(response.credential);
    console.log(payLoad);
    _this.lStorageService.setitemonLocalStorage('googleToken', 'googleToken-' + response.credential);
    const credentials = {
      accountId: _this.accountProfile.id
    }
    credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
    _this.authService.login(credentials).then((response) => {
      console.log("Login Response:", response);
      _this.ngZone.run(
        () => {
          const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
          _this.lStorageService.setitemonLocalStorage('refreshToken', token);
          _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
          _this.lStorageService.setitemonLocalStorage('fromLogin', true);
          _this.performAction();
        }
      )
    }, (error: any) => {
      if (error.status === 401 && error.error === 'Session Already Exist') {
        const activeUser = _this.lStorageService.getitemfromLocalStorage('ynw-user');
        if (!activeUser) {
          _this.authService.doLogout().then(
            () => {
              _this.authService.login(credentials).then(
                () => {
                  _this.ngZone.run(
                    () => {
                      const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                    _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                      _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                      _this.lStorageService.removeitemfromLocalStorage('googleToken');
                      _this.lStorageService.setitemonLocalStorage('fromLogin', true);
                      _this.performAction();
                    }
                  )
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
        _this.ngZone.run(
          () => {
            _this.step = 2;
          }
        )
      }
    });
  }

  /**
   * Phone Number Collection for Account Existence
   */
  //  sendOTP(mode?) {
  //   this.phoneError = null;
  //   this.emailError = null;
  //   this.btnClicked = true;
  //   this.lStorageService.removeitemfromLocalStorage('authorization');
  //   this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
  //   this.lStorageService.removeitemfromLocalStorage('googleToken');
  //   if(this.notifyEmail){
  //     if (this.phoneNumber && this.phoneNumber.dialCode === '+91' && this.emailId) {
  //       this.dialCode = this.phoneNumber.dialCode;
  //       const pN = this.phoneNumber.e164Number.trim();
  //       let loginId = pN;
  //       if (pN.startsWith(this.dialCode)) {
  //         loginId = pN.split(this.dialCode)[1];
  //         if (loginId.startsWith('55')) {
  //           this.config.length = 5;
  //         }
  //       }
  //       this.performSendOTP(loginId, this.emailId, mode);
  //     } else if (this.phoneNumber && this.phoneNumber.dialCode !== '+91' && this.emailId) {
  //       this.dialCode = this.phoneNumber.dialCode;
  //       const pN = this.phoneNumber.e164Number.trim();
  //       let loginId = pN.split(this.dialCode)[1];
  //       this.performSendOTP(loginId, this.emailId, mode);
  //     } 
  //     else if(this.emailId === undefined) {
  //       this.emailError = 'Email ID required';
  //       this.btnClicked = false;
  //     }
  //     else {
  //       this.phoneError = 'Mobile number required';
  //       this.btnClicked = false;
  //     }
  //   }
  //   else{
  //     if (this.phoneNumber && this.phoneNumber.dialCode === '+91') {
  //       this.dialCode = this.phoneNumber.dialCode;
  //       const pN = this.phoneNumber.e164Number.trim();
  //       let loginId = pN;
  //       if (pN.startsWith(this.dialCode)) {
  //         loginId = pN.split(this.dialCode)[1];
  //         if (loginId.startsWith('55')) {
  //           this.config.length = 5;
  //         }
  //       }
  //       this.performSendOTP(loginId, null, mode);
  //     } else if (this.phoneNumber && this.phoneNumber.dialCode !== '+91') {
  //       this.dialCode = this.phoneNumber.dialCode;
  //       const pN = this.phoneNumber.e164Number.trim();
  //       let loginId = pN.split(this.dialCode)[1];
  //       this.performSendOTP(loginId, this.emailId, mode);
  //     } 
  //     else {
  //       this.phoneError = 'Mobile number required';
  //       this.btnClicked = false;
  //     }
  //   }
  
  // }
  sendOTP(mode?) {
    this.phoneError = null;
    this.btnClicked = true;
    this.lStorageService.removeitemfromLocalStorage('authorization');
    this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
    this.lStorageService.removeitemfromLocalStorage('googleToken');
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
  clearPhoneExists() {
    this.isLogin = true;
  }
  performSendOTP(loginId, emailId?, mode?) {
    let credentials = {
      countryCode: this.dialCode,
      loginId: loginId,
      accountId: this.accountProfile.id
    }
    if (this.phoneNumber && this.phoneNumber.dialCode !== '+91') {
      if (!this.isLogin) {
        if (emailId && this.validateEmail(emailId)) {
          credentials['alternateLoginId'] = emailId;
        } else {
          this.snackbarService.openSnackBar("Invalid email", { 'panelClass': 'snackbarerror' });
          this.btnClicked = false;
          return false;
        }
      }
    }
    this.lStorageService.removeitemfromLocalStorage("authorizationToken");
    this.subscriptions.sink = this.authService.sendConsumerOTP(credentials).subscribe(
      (response) => {   
        if (!response && this.phoneNumber && this.phoneNumber.dialCode !== '+91' && !emailId) {
          this.isLogin = false;
          this.btnClicked = false;
        } else {
          this.step = 3;
          this.btnClicked = false;
          if (mode == 'resent') {
            this.snackbarService.openSnackBar("OTP has been sent successfully", { 'panelClass': 'snackbarnormal' });
          }
        }
      }, (error) => {
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        this.btnClicked = false;
      }
    )
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
      } else {
        this.btnClicked = true;
        this.verifyOTP();
      }
    }
  }
  verifyOTPs() {
    if (this.forTest == true) {
      this.verifyOTPForTest();
    } else {
      this.verifyOTP();
    }
  }

  verifyOTP() {
    const _this = this;
    this.otpSuccess = '';
    this.otpError = '';
    this.loading = true;
    if (this.otpEntered === '' || this.otpEntered === undefined) {
      this.otpError = 'Invalid OTP';
    } else {
      this.subscriptions.sink = this.authService.verifyConsumerOTP(this.otpEntered).subscribe(
        (response: any) => {
          this.loading = false;
          let loginId;
          const pN = this.phoneNumber.e164Number.trim();
          if (pN.startsWith(this.dialCode)) {
            loginId = pN.split(this.dialCode)[1];
          }
          if (!response.linkedToPrivateDatabase) {
            this.lStorageService.setitemonLocalStorage('authorizationToken', response.token);
            this.step = 2;
            this.btnClicked = false;
          } else {
            this.lStorageService.setitemonLocalStorage('authorizationToken', response.token);
            const credentials = {
              countryCode: this.dialCode,
              loginId: loginId,
              accountId: this.accountProfile.id
            }
            console.log(this.lStorageService.getitemfromLocalStorage('authorizationToken'));
            console.log(credentials);
            this.authService.login(credentials).then((response) => {
              console.log("Login Response:", response);
              this.btnClicked = false;
              _this.ngZone.run(
                () => {
                  const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                  _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                  _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                  _this.performAction();
                }
              )
            }, (error: any) => {
              console.log(error);
              this.btnClicked = false;
              if (error.status === 401 && error.error === 'Session Already Exist') {
                const isLoggedIn = _this.lStorageService.getitemfromLocalStorage('ynw-credentials');
                console.log(isLoggedIn);
                if (!isLoggedIn) {
                  let authToken = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                  _this.authService.doLogout().then(
                    () => {                      
                      this.lStorageService.setitemonLocalStorage('authorizationToken', authToken);
                      _this.authService.login(credentials).then(
                        () => {
                          _this.ngZone.run(
                            () => {
                              const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                                _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                              _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                              _this.lStorageService.setitemonLocalStorage('fromLogin', true);
                              _this.performAction();
                            }
                          )
                        });
                    }
                  )
                } else {
                  this.btnClicked = false;
                  _this.performAction();
                }
              } else if (error.status === 401) {
                _this.ngZone.run(
                  () => {
                    _this.step = 2;
                  }
                )
              }
            })
          }
        }, error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          this.loading = false;
        }
      );
    }
  }
  verifyOTPForTest() {
    const _this = this;
    this.otpSuccess = '';
    this.otpError = '';
    this.loading = true;
    let purpose ='login'
    if (this.otpEntered === '' || this.otpEntered === undefined) {
      this.otpError = 'Invalid OTP';
    } else {
      this.subscriptions.sink = this.authService.verifyConsumerOTPForTest(purpose,this.otpEntered).subscribe(
        (response: any) => {
          this.loading = false;
          let loginId;
          const pN = this.phoneNumber.e164Number.trim();
          if (pN.startsWith(this.dialCode)) {
            loginId = pN.split(this.dialCode)[1];
          }
          if (!response.linkedToPrivateDatabase) {
            this.lStorageService.setitemonLocalStorage('authorizationToken', response.token);
            this.step = 2;
            this.btnClicked = false;
          } else {
            this.lStorageService.setitemonLocalStorage('authorizationToken', response.token);
            const credentials = {
              countryCode: this.dialCode,
              loginId: loginId,
              accountId: this.accountProfile.id
            }
            console.log(this.lStorageService.getitemfromLocalStorage('authorizationToken'));
            console.log(credentials);
            this.authService.login(credentials).then((response) => {
              console.log("Login Response:", response);
              this.btnClicked = false;
              _this.ngZone.run(
                () => {
                  const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                  _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                  _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                  _this.performAction();
                }
              )
            }, (error: any) => {
              console.log(error);
              this.btnClicked = false;
              if (error.status === 401 && error.error === 'Session Already Exist') {
                const isLoggedIn = _this.lStorageService.getitemfromLocalStorage('ynw-credentials');
                console.log(isLoggedIn);
                if (!isLoggedIn) {
                  let authToken = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                  _this.authService.doLogout().then(
                    () => {                      
                      this.lStorageService.setitemonLocalStorage('authorizationToken', authToken);
                      _this.authService.login(credentials).then(
                        () => {
                          _this.ngZone.run(
                            () => {
                              const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                                _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                              _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                              _this.lStorageService.setitemonLocalStorage('fromLogin', true);
                              _this.performAction();
                            }
                          )
                        });
                    }
                  )
                } else {
                  this.btnClicked = false;
                  _this.performAction();
                }
              } else if (error.status === 401) {
                _this.ngZone.run(
                  () => {
                    _this.step = 2;
                  }
                )
              }
            })
          }
        }, error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          this.loading = false;
        }
      );
    }
  }
  performAction() {
    
    const _this = this;
    let target = _this.lStorageService.getitemfromLocalStorage('target');
    console.log("In Perform Action",target)
    if (target) {
      _this.lStorageService.removeitemfromLocalStorage('target');
      _this.router.navigateByUrl(target);
    } else {
      this.goToDashboard();
    }
  }
  goBack() {
    this.initGoogleButton();
    this.step = 1;
  }
  signUpConsumer() {
    const _this = this;
    _this.phoneError = '';
    _this.emailError = '';
    if (_this.phoneNumber) {
      _this.dialCode = _this.phoneNumber.dialCode;
      const pN = _this.phoneNumber.e164Number.trim();
      let phoneNum;
      if (pN.startsWith(_this.dialCode)) {
        phoneNum = pN.split(_this.dialCode)[1];
      }
      let credentials = {
        accountId: _this.accountProfile.id,
        userProfile: {
          title:_this.title,
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
            accountId: _this.accountProfile.id
          }
          credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
          this.authService.login(credentials).then((response) => {
            console.log("Login Response:", response);
            _this.ngZone.run(
              () => {
                const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                _this.performAction();
              }
            )
          });
        }, (error) => {
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        })
      } else {
        if (_this.dialCode !== '+91') {
          credentials['userProfile']['email'] = _this.emailId;
        }
        _this.authService.signUp(credentials).then((response) => {
          let credentials = {
            accountId: _this.accountProfile.id,
            countryCode: _this.dialCode,
            loginId: phoneNum
          }
          credentials['mUniqueId'] = this.lStorageService.getitemfromLocalStorage('mUniqueId');
          this.authService.login(credentials).then((response) => {
            console.log("Login Response:", response);
            _this.ngZone.run(
              () => {
                const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                _this.performAction();
              }
            )
          });
        }, (error) => {
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        });
      }
    } else {
      _this.phoneError = 'Mobile number required';
    }
  }
  resetApiErrors() {
    this.phoneError = null;
    this.emailError = null;
  }
}

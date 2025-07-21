import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { SubSink } from 'subsink';
import { AuthService } from '../../services/auth-service';
import jwt_decode from "jwt-decode";
import { Messages } from 'jaldee-framework/constants';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../../services/account-service';
import { StorageService } from '../../services/storage.service';
declare var google;
@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit, OnDestroy {
  SearchCountryField = SearchCountryField;
  selectedCountry = CountryISO.India;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedKingdom, CountryISO.UnitedStates];
  separateDialCode = true;
  loading = false;
  public finalResponse;
  @ViewChild('googleBtn') googleButton: ElementRef;
  step: any = 1; //
  api_loading;
  phoneExists;
  phoneError: string;
  emailError: string;
  phoneNumber;
  dialCode: any;
  isPhoneValid: boolean;
  firstName;
  lastName;
  emailId;
  password;
  rePassword;
  btnClicked = false;
  @Input() accountId;
  @Input() accountConfig;
  @Output() actionPerformed = new EventEmitter<any>();
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
  private subs = new SubSink();
  email: any;
  googleLogin: boolean;
  googleIntegration: boolean;
  heading = "Let's Start";
  subHeading = "";
  alignClass: any;
  theme: any;
  templateJson: any;
  loginResponse;
  notifyEmail = false;

  isSmsEmail: boolean;
  isSms: boolean;
  isEmail: boolean;
  isLogin = true;
  salutation: any;
  title: any;
  forTest = true;
  isPartnerLogin = false;
  constructor(
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private renderer: Renderer2,
    private snackbarService: SnackbarService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    public translate: TranslateService,
    private accountService: AccountService,
    private storageService:StorageService,
  ) {
    this.loading = true;
    if(this.lStorageService.getitemfromLocalStorage('partner')) {
      this.isPartnerLogin = true;
      console.log("this.isPartnerLogin",this.isPartnerLogin)
    }
  }
  ngOnDestroy(): void {
    this.lStorageService.removeitemfromLocalStorage('login');
  }
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
  ngOnInit(): void {
    this.storageService.getSalutations().then((data: any) => { 
      this.salutation = data;
    });
    this.lStorageService.removeitemfromLocalStorage('login');
    this.lStorageService.removeitemfromLocalStorage('logout');
    this.accountConfig = this.accountService.getAccountConfig();
    this.templateJson = this.accountService.getTemplateJson();
    console.log("this.accountConfig", this.accountConfig);
    if (this.templateJson && this.templateJson['theme']) {
      this.theme = this.templateJson['theme'];
    }
    if (this.accountConfig  && this.accountConfig['login']) {
      if (this.accountConfig['login']['heading']) {
        this.heading = this.accountConfig['login']['heading'];
      }
      if (this.accountConfig['login']['subHeading']) {
        this.subHeading = this.accountConfig['login']['subHeading'];
      }
      if (this.accountConfig['login']['align']) {
        this.alignClass = this.accountConfig['login']['align'];
      }
    }
    if (this.accountConfig && this.accountConfig['googleIntegration'] === false) {
      this.googleIntegration = false;
    } else {
      this.googleIntegration = true;
      if(!this.isPartnerLogin) {
        this.initGoogleButton();
      }
    }
    this.loading = false;
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
    // this.lStorageService.removeitemfromLocalStorage('authToken');
    // this.lStorageService.removeitemfromLocalStorage('authorization');
    // this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
    // this.lStorageService.removeitemfromLocalStorage('googleToken');
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
  //  sendOTP(mode?) {
  //   this.phoneError = null;
  //   this.emailError = null;
    
  //   this.btnClicked = true;
  //   this.lStorageService.removeitemfromLocalStorage('login');
  //   this.lStorageService.removeitemfromLocalStorage('logout');
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
  validateEmail(mail) {
    const emailField = mail;
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(emailField) === false) {
      return false;
    }
    return true;
  }
  clearPhoneExists() {
    this.phoneExists = false;
    this.isLogin = true;
  }
  performSendOTP(loginId, emailId?, mode?) {

    console.log("Perform Send OTP");
    let credentials = {
      countryCode: this.dialCode,
      loginId: loginId,
      accountId: this.accountId,
      isPartner: this.isPartnerLogin
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
    this.subs.sink = this.authService.sendConsumerOTP(credentials).subscribe(
      (response: any) => {
        if (!response && this.phoneNumber && this.phoneNumber.dialCode !== '+91' && !emailId) {
          this.isLogin = false;
          this.btnClicked = false;
        } else {
          this.step = 3;
          this.btnClicked = false;
          if (mode == 'resent') {
            this.snackbarService.openSnackBar("OTP has been sent successfully",{ 'panelClass': 'snackbarnormal' });
          }
        }
      }, (error) => {
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        this.btnClicked = false;
      }
    )
  }
  resetApiErrors() {
    this.phoneError = null;
    this.emailError = null;
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
    _this.emailError = '';
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
            accountId: _this.accountId
          }
          _this.authService.login(credentials).then(
            () => {
              const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
              _this.lStorageService.setitemonLocalStorage('refreshToken', token);
              _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
              _this.lStorageService.removeitemfromLocalStorage('googleToken');
              _this.ngZone.run(() => {
                _this.actionPerformed.emit('success');
                _this.cd.detectChanges();
              });
            }, (error) => {
              _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
            });
          console.log("Signup Success:", response);
        }, (error) => {
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
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
            _this.authService.setLoginData(response, credentials, 'consumer');
            console.log("Login Response:", response);
            _this.ngZone.run(() => {
              const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
              _this.lStorageService.setitemonLocalStorage('refreshToken', token);
              _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
              _this.lStorageService.setitemonLocalStorage('fromLogin', true);
              _this.actionPerformed.emit('success');
              _this.cd.detectChanges();
            });
          }, (error) => {
            _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          })
        }, (error) => {
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
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
      } else {
        // this.btnClicked = true;
        // this.verifyOTP();
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
    this.btnClicked = true;
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
        this.snackbarService.openSnackBar('Invalid OTP', { 'panelClass': 'snackbarerror' });
        this.api_loading=false;
        this.btnClicked = false;
        return false;
      } else if (this.otpEntered.length < 4) {
        this.snackbarService.openSnackBar('Invalid OTP', { 'panelClass': 'snackbarerror' });
        this.api_loading=false;
        this.btnClicked = false;
        // this.otpError = 'Invalid OTP';
        return false;
      }
    }
    this.api_loading = false;
    this.loading = true;
    if (this.otpEntered === '' || this.otpEntered === undefined) {
      this.otpError = 'Invalid OTP';
      this.loading = false;
      this.btnClicked = false;
    } else {
      this.subs.sink = this.authService.verifyConsumerOTP(this.otpEntered)
        .subscribe(
          (response: any) => {
            this.loading = false;
            let loginId;
            const pN = this.phoneNumber.e164Number.trim();
            if (pN.startsWith(this.dialCode)) {
              loginId = pN.split(this.dialCode)[1];
            }
            if (!response.linkedToPrivateDatabase) {
              if (!this.isPartnerLogin) {
                this.lStorageService.setitemonLocalStorage('authorizationToken', response.token);
                this.step = 2;
                this.btnClicked = false;
              } else {
                this.step = 1;
                this.phoneNumber = '';
                this.lStorageService.removeitemfromLocalStorage('logout');
                this.lStorageService.removeitemfromLocalStorage('authorization');
                this.lStorageService.removeitemfromLocalStorage('refreshToken');
                this.lStorageService.removeitemfromLocalStorage('activeLocation');
                this.snackbarService.openSnackBar('Partner is not registered', { 'panelClass': 'snackbarerror' });
                this.btnClicked = false;
              }
            } else {
              this.lStorageService.setitemonLocalStorage('authorizationToken', response.token);
              const credentials = {
                countryCode: this.dialCode,
                loginId: loginId,
                accountId: this.accountId
              }
              this.authService.login(credentials).then((response) => {
                console.log("Login Response:", response);
                // const reqFrom = this.lStorageService.getitemfromLocalStorage('reqFrom');
                const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
              _this.lStorageService.setitemonLocalStorage('refreshToken', token);
              _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                _this.actionPerformed.emit('success');
                this.btnClicked = false;
              }, (error: any) => {
                this.btnClicked = false;
                if (error.status === 401 && error.error === 'Session Already Exist') {
                  const activeUser = _this.lStorageService.getitemfromLocalStorage('ynw-user');
                  if (!activeUser) {
                    _this.authService.doLogout().then(
                      () => {
                        _this.lStorageService.removeitemfromLocalStorage('logout');
                        _this.authService.login(credentials).then(
                          () => {
                            _this.ngZone.run(
                              () => {
                                const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                                _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                                _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                                _this.lStorageService.setitemonLocalStorage('fromLogin', true);
                                _this.actionPerformed.emit('success');
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
                      _this.step = 2;
                      this.btnClicked = false;
                    }
                  )
                }
              })
            }
          },
          error => {
            this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
            this.loading = false;
            this.btnClicked = false;
          }
        );
  }
  }
  verifyOTPForTest() {
    const _this = this;
    this.btnClicked = true;
    this.otpSuccess = '';
    this.otpError = '';
    this.api_loading = true;
    let purpose ='login'
    console.log(this.otpEntered);
    if (this.phoneNumber) {
      const pN = this.phoneNumber.e164Number.trim();
      let phoneNumber;
      if (pN.startsWith(this.dialCode)) {
        phoneNumber = pN.split(this.dialCode)[1];
      }
      if (this.phoneNumber.dialCode === '+91' && phoneNumber.startsWith('55') && this.otpEntered.length < 5) {
        // this.otpError = 'Invalid OTP';
        this.snackbarService.openSnackBar('Invalid OTP', { 'panelClass': 'snackbarerror' });
        this.api_loading=false;
        this.btnClicked = false;
        return false;
      } else if (this.otpEntered.length < 4) {
        this.snackbarService.openSnackBar('Invalid OTP', { 'panelClass': 'snackbarerror' });
        this.api_loading=false;
        this.btnClicked = false;
        // this.otpError = 'Invalid OTP';
        return false;
      }
    }
    this.api_loading = false;
    this.loading = true;
    if (this.otpEntered === '' || this.otpEntered === undefined) {
      this.otpError = 'Invalid OTP';
      this.loading = false;
      this.btnClicked = false;
    } else {
      this.subs.sink = this.authService.verifyConsumerOTPForTest(purpose,this.otpEntered)
        .subscribe(
          (response: any) => {
            this.loading = false;
            let loginId;
            const pN = this.phoneNumber.e164Number.trim();
            if (pN.startsWith(this.dialCode)) {
              loginId = pN.split(this.dialCode)[1];
            }
            if (!response.linkedToPrivateDatabase) {
              if (!this.isPartnerLogin) {
                this.lStorageService.setitemonLocalStorage('authorizationToken', response.token);
                this.step = 2;
                this.btnClicked = false;
              } else {
                this.step = 1;
                this.phoneNumber = '';
                this.lStorageService.removeitemfromLocalStorage('logout');
                this.lStorageService.removeitemfromLocalStorage('authorization');
                this.lStorageService.removeitemfromLocalStorage('refreshToken');
                this.lStorageService.removeitemfromLocalStorage('activeLocation');
                this.snackbarService.openSnackBar('Partner is not registered', { 'panelClass': 'snackbarerror' });
                this.btnClicked = false;
              }
            } else {
              this.lStorageService.setitemonLocalStorage('authorizationToken', response.token);
              const credentials = {
                countryCode: this.dialCode,
                loginId: loginId,
                accountId: this.accountId
              }
              this.authService.login(credentials).then((response) => {
                console.log("Login Response:", response);
                // const reqFrom = this.lStorageService.getitemfromLocalStorage('reqFrom');
                const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
              _this.lStorageService.setitemonLocalStorage('refreshToken', token);
              _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                _this.actionPerformed.emit('success');
                this.btnClicked = false;
              }, (error: any) => {
                this.btnClicked = false;
                if (error.status === 401 && error.error === 'Session Already Exist') {
                  const activeUser = _this.lStorageService.getitemfromLocalStorage('ynw-user');
                  if (!activeUser) {
                    _this.authService.doLogout().then(
                      () => {
                        _this.lStorageService.removeitemfromLocalStorage('logout');
                        _this.authService.login(credentials).then(
                          () => {
                            _this.ngZone.run(
                              () => {
                                const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
                                _this.lStorageService.setitemonLocalStorage('refreshToken', token);
                                _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                                _this.lStorageService.setitemonLocalStorage('fromLogin', true);
                                _this.actionPerformed.emit('success');
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
                      _this.step = 2;
                      this.btnClicked = false;
                    }
                  )
                }
              })
            }
          },
          error => {
            this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
            this.loading = false;
            this.btnClicked = false;
          }
        );
  }
  }
  handleCredentialResponse(response) {
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('googleToken');
    console.log(response);
    this.googleLogin = true;
    const payLoad = jwt_decode(response.credential);
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
          const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
          _this.lStorageService.setitemonLocalStorage('refreshToken', token);
          _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
          _this.lStorageService.removeitemfromLocalStorage('googleToken');
          _this.lStorageService.setitemonLocalStorage('fromLogin', true);
          _this.actionPerformed.emit('success');
        }
      )
    }, (error: any) => {
      if (error.status === 401 && error.error === 'Session Already Exist') {
        const activeUser = _this.lStorageService.getitemfromLocalStorage('ynw-user');
        if (!activeUser) {
          _this.authService.doLogout().then(
            () => {
              _this.lStorageService.removeitemfromLocalStorage('logout');
              _this.authService.login(credentials).then(
                () => {
                  _this.ngZone.run(
                    () => {
                      const token = _this.lStorageService.getitemfromLocalStorage('authorizationToken');
              _this.lStorageService.setitemonLocalStorage('refreshToken', token);
              _this.lStorageService.removeitemfromLocalStorage('authorizationToken');
                      _this.lStorageService.removeitemfromLocalStorage('googleToken');
                      _this.lStorageService.setitemonLocalStorage('fromLogin', true);
                      _this.actionPerformed.emit('success');
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
}
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AccountService } from "../../services/account-service";

@Component({
  selector: 'app-business-page-home',
  templateUrl: './business-page-home.component.html',
  styleUrls: ['./business-page-home.component.css']

})
export class BusinessPageHomeComponent implements OnInit {

  @ViewChild('privacyPolicy') privacyPolicy: ElementRef;
  @ViewChild('termsConditions') termsConditions: ElementRef;
  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  target: any;
  businessName;
  bLogo = '';
  emaillist: any = [];
  phonelist: any = [];
  selectedMenu = 'contact';
  customConf = {}
  theme: any;
  account: any;
  accountConfig: any;
  accountProfile: any;

  constructor(private domSanitizer: DomSanitizer,
    private activateroute: ActivatedRoute,
    private router: Router,
    private observer: BreakpointObserver,
    private accountService: AccountService) {
  }
  ngOnInit() {
    const _this = this;
    this.activateroute.queryParams.subscribe(
      (queryParams: any) => {
        if (queryParams.target) {
          this.selectedMenu = queryParams.target;
        }
      }
    )
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.businessName = this.accountProfile.businessName;
    if (this.accountProfile.emails) {
      this.emaillist = this.accountProfile.emails;
    }
    if (this.accountProfile.phoneNumbers) {
      this.phonelist = this.accountProfile.phoneNumbers;
    }
    if (this.accountProfile.logo.url !== undefined && this.accountProfile.logo.url !== '') {
      this.bLogo = this.accountProfile.logo.url;
    } else {
      this.bLogo = '../../../assets/images/img-null.svg';
    }
    if (this.accountConfig) {
      if (this.accountConfig['contact']) {
        this.customConf['contact'] = this.accountConfig['contact'];
      }
      if (this.accountConfig['refund']) {
        this.customConf['refund'] = this.accountConfig['refund'];
      }
      if (this.accountConfig['terms']) {
        if (this.accountConfig.terms.startsWith('https')) {
          this.customConf['terms_type'] = 'url';
          this.customConf['terms'] = this.domSanitizer.bypassSecurityTrustResourceUrl(this.accountConfig.terms);
        } else {
          this.customConf['terms'] = this.accountConfig['terms'];
        }
      }
      if (this.accountConfig['theme']) {
        _this.theme = this.accountConfig['theme'];
      }
      if (this.accountConfig['privacy']) {
        if (this.accountConfig.privacy.startsWith('https')) {
          this.customConf['privacy_type'] = 'url';
          this.customConf['privacy'] = this.domSanitizer.bypassSecurityTrustResourceUrl(this.accountConfig.terms);
        } else {
          this.customConf['privacy'] = this.accountConfig['privacy'];
        }
      }
    }
  }
  ngAfterViewInit() {
    const _this = this;
    _this.sidenav.mode = 'over';
    this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
      setTimeout(() => {
        if (res.matches) {
          _this.sidenav.mode = 'over';
          _this.sidenav.close();
        } else {
          _this.sidenav.mode = 'side';
          _this.sidenav.open();
        }
      }, 100);

    });
  }
  menuClicked(selectedMenu) {
    this.selectedMenu = selectedMenu;
  }
  goBack() {
    let customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.router.navigate([customId]);
  }
}

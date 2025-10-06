import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountService, CommonService, LocalStorageService, projectConstantsLocal, SharedService, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutUserComponent implements OnInit {
  serverDate: any;
  account: any;
  accountConfig: any;
  theme: any;
  accountProfile: any;
  bgCover: any;
  bLogo: any;
  selectedLocation: any;
  basicProfile: any = {};
  phoneNumbers;
  emails;
  virtualfieldsjson: any;
  virtualfieldsDomainjson: any[];
  virtualfieldsCombinedjson: any[];
  virtualfieldsSubdomainjson: any[];
  orgsocial_list = projectConstantsLocal.SOCIAL_MEDIA_CONSUMER;
  userId: string;
  userProfile: any;
  extras = {
    icons: true
  }
  constructor(
    private lStorageService: LocalStorageService,
    private accountService: AccountService,
    private sharedService: SharedService,
    public translate: TranslateService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    public wordProcessor: WordProcessor,
    private commonService: CommonService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.userId = params.get('userEncId');
    });
  }
  profileActionPerformed(event) {
  }
  ngOnInit(): void {
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.account = this.sharedService.getAccountInfo();
    this.accountConfig = this.sharedService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.selectedLocation = this.accountService.getActiveLocation();
    const _this = this;
    this.accountService.getUserInformation(this.accountProfile.uniqueId, this.userId).then(
      (userAccountInfo: any) => {
        this.userProfile = _this.accountService.getJson(userAccountInfo['providerBusinessProfile']);
        _this.setBasicProfile(this.userProfile);
        let virtualFields = this.accountService.getJson(userAccountInfo['providerVirtualFields']);
        this.setUserVirtualFields(virtualFields);
      }
    );
  }
  goBack() {
    this.location.back();
  }
  setBasicProfile(accountProfile) {
    this.basicProfile['theme'] = this.theme;
    this.basicProfile['businessName'] = accountProfile['businessName'];
    if (this.accountProfile.cover) {
      this.bgCover = this.accountProfile.cover.url;
    }
    this.basicProfile['cover'] = this.bgCover;
    if (this.accountProfile.emails) {
      this.basicProfile['emails'] = accountProfile.emails;
    }
    if (this.accountProfile.phoneNumbers) {
      this.basicProfile['phoneNumbers'] = accountProfile.phoneNumbers;
    }
    if (accountProfile.baseLocation) {
      this.basicProfile['baseLocation'] = accountProfile.baseLocation;
    }
    this.basicProfile['logo'] = accountProfile.logo?.url;
    this.basicProfile['socialMedia'] = accountProfile.socialMedia;

    console.log("Social Media", accountProfile.socialMedia);
  }

  setUserVirtualFields(res) {
    this.virtualfieldsjson = res;
    this.virtualfieldsCombinedjson = [];
    this.virtualfieldsDomainjson = [];
    this.virtualfieldsSubdomainjson = [];
    if (this.virtualfieldsjson.domain) {
      this.virtualfieldsDomainjson = this.commonService.sortVfields(this.virtualfieldsjson.domain);
    }
    if (this.virtualfieldsjson.subdomain) {
      this.virtualfieldsSubdomainjson = this.commonService.sortVfields(this.virtualfieldsjson.subdomain);
    }
    if (this.virtualfieldsSubdomainjson.length && this.virtualfieldsDomainjson.length) {
      this.virtualfieldsCombinedjson = this.virtualfieldsSubdomainjson.concat(this.virtualfieldsDomainjson);
    } else if (this.virtualfieldsSubdomainjson.length && !this.virtualfieldsDomainjson.length) {
      this.virtualfieldsCombinedjson = this.virtualfieldsSubdomainjson;
    } else if (!this.virtualfieldsSubdomainjson.length && this.virtualfieldsDomainjson.length) {
      this.virtualfieldsCombinedjson = this.virtualfieldsDomainjson;
    }
  }
  getSocialdet(key, field) {
    const retdet = this.orgsocial_list.filter(
      soc => soc.key === key);
    let returndet = retdet[0][field];
    if (returndet === 'BizyGlobe') {
      returndet = 'bizyGlobe';
    }
    return returndet;
  }

  actionPerformed(action) {

  }
}

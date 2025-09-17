import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AccountService, CommonService, LocalStorageService, projectConstantsLocal, SharedService, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss']
})
export class AboutusComponent implements OnInit {
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
  extras = {
    icons: true,
    more: false,
    enquiry: false
  };
  virtualfieldsjson: any;
  virtualfieldsDomainjson: any[];
  virtualfieldsCombinedjson: any[];
  virtualfieldsSubdomainjson: any[];
  orgsocial_list = projectConstantsLocal.SOCIAL_MEDIA_CONSUMER;

  constructor(
    private lStorageService: LocalStorageService,
    private accountService: AccountService,
    private commonService: CommonService,
    private sharedService: SharedService,
    public translate: TranslateService,
    private location: Location,
    public wordProcessor: WordProcessor
  ) { }

  ngOnInit(): void {
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.account = this.sharedService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    let virtualFields = this.accountService.getJson(this.account['virtualFields']);
    this.setAccountVirtualFields(virtualFields);
    this.setBasicProfile();
    this.selectedLocation = this.accountService.getActiveLocation();
  }
  goBack() {
    this.location.back();
  }
  profileActionPerformed(event) {

  }
  setBasicProfile() {
    this.basicProfile['theme'] = this.theme;
    this.basicProfile['businessName'] = this.accountProfile['businessName'];
    if (this.accountProfile['businessUserName']) {
      this.basicProfile['businessUserName'] = this.accountProfile['businessUserName'];
    }
    if (this.accountProfile.cover) {
      this.bgCover = this.accountProfile.cover.url;
    }
    this.basicProfile['cover'] = this.bgCover;
    if (this.accountProfile.emails) {
      this.basicProfile['emails'] = this.accountProfile.emails;
    }
    if (this.accountProfile.phoneNumbers) {
      this.basicProfile['phoneNumbers'] = this.accountProfile.phoneNumbers;
    }
    if (this.accountProfile.baseLocation) {
      this.basicProfile['baseLocation'] = this.accountProfile.baseLocation;
    }
    this.basicProfile['logo'] = this.accountProfile.logo?.url;
    this.basicProfile['socialMedia'] = this.accountProfile.socialMedia;
  }

  setAccountVirtualFields(res) {
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

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService, LocalStorageService, SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

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
  constructor(
    private lStorageService: LocalStorageService,
    private accountService: AccountService,
    private sharedService: SharedService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.sharedService.getAccountInfo();
    this.accountConfig = this.sharedService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
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
  }

  actionPerformed(action) {

  }
}

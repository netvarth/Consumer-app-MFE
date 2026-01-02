import { Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core';
import { AccountService, CommonService, projectConstantsLocal, SharedService, SubscriptionService } from 'jconsumer-shared';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-service-selection',
  templateUrl: './service-selection.component.html',
  styleUrls: ['./service-selection.component.scss']
})
export class ServiceSelectionComponent implements OnInit, OnChanges {

  selectedServiceId;// Id of the appointment service
  activeServices;
  selectedService;
  accountProfile: any;
  @Output() serviceSelected = new EventEmitter<any>();
  @Output() actionPerformed = new EventEmitter<any>();
  selectedUser: any;
  account: any;
  userProfile: any;
  basicProfile: any = {};
  bgCover: any;
  theme: any;
  virtualfieldsjson: any;
  virtualfieldsDomainjson: any[];
  virtualfieldsCombinedjson: any[];
  virtualfieldsSubdomainjson: any[];
  accountConfig: any;
  selectedLocation: any;
  orgsocial_list = projectConstantsLocal.SOCIAL_MEDIA_CONSUMER;
  cdnPath: string = '';
  constructor(
    private bookingService: BookingService,
    private commonService: CommonService,
    private subscriptionService: SubscriptionService,
    private sharedService: SharedService,
    private accountService: AccountService
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.subscriptionService.getMessage().subscribe((message) => {
      switch (message.ttype) {
        case 'refresh':
          this.activeServices = this.bookingService.getActiveServices();
      }
   });
  }

  ngOnInit(): void {
  
    this.selectedUser = this.bookingService.getSelectedUser();
   
    this.selectedService=this.bookingService.getSelectedService();
    if (this.selectedService) {
      this.selectedServiceId = this.selectedService.id;
    }
    this.activeServices = this.bookingService.getActiveServices();
    
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.selectedLocation = this.accountService.getActiveLocation();
    console.log("Active Services:", this.selectedLocation);
    if(this.selectedUser){
      this.getBusinessProfileFromCustomId()
    }
    this.accountConfig = this.sharedService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    
  }
ngOnChanges() {}
  goBack() {
    this.actionPerformed.emit({'action':'back'});
  }
  goToStep() {
    this.actionPerformed.emit({'action':'next'});
  }
  
  getBusinessProfileFromCustomId(){
    const _this = this;
    this.accountService.getUserInformation(this.accountProfile.uniqueId, this.selectedUser.id).then(
      (userAccountInfo: any)=> {
        this.userProfile = _this.sharedService.getJson(userAccountInfo['providerBusinessProfile']);
        console.log(' this.userProfile', this.userProfile)
        _this.setBasicProfile(this.userProfile);
        let virtualFields =  this.sharedService.getJson(userAccountInfo['providerVirtualFields']);
        this.setUserVirtualFields(virtualFields);

      }
    );
  }
  setBasicProfile(accountProfile) {
    this.basicProfile['theme'] = this.theme;
    this.basicProfile['businessName'] = accountProfile['businessName'];
    if (this.accountProfile['businessUserName']) {
      this.basicProfile['businessUserName'] = this.accountProfile['businessUserName'];
    }
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
    console.log("Social Media",accountProfile.socialMedia);
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
      let returndet='';
      if (retdet && retdet[0] && retdet[0][field]) {
        let returndet = retdet[0][field];
        if (returndet === 'BizyGlobe') {
          returndet = 'bizyGlobe';
        }
        return returndet;
      }
      return returndet;
  }
  
  serviceClicked(activeService) {
    let selectedService = activeService;
    selectedService['duration'] = activeService.serviceDuration;
    selectedService['price'] = activeService.totalAmount;
    this.selectedServiceId = selectedService.id;
    this.selectedService = selectedService;
    console.log("Service Clicked:", activeService);
    this.serviceSelected.emit(selectedService);
    this.goToStep();
  }
  convertToHtml(text: string): string {
    return text.replace(/\n/g, '<br>');
  }
}

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-advanced-profile',
  templateUrl: './advanced-profile.component.html',
  styleUrls: ['./advanced-profile.component.css']
})
export class AdvancedProfileComponent implements OnInit {

  @Input() accountProfile;
  @Input() templateJson;
  @Input() selectedLocation;
  emailId: any;
  phoneNo: any;
  location: any;
  bLogo:any;
  businessDesc: any;
  specialities: any;
  constructor() { }

  ngOnInit(): void {
    console.log("bprofile",this.templateJson)
    if (this.accountProfile.logo) {
      this.bLogo = this.accountProfile.logo.url;
    }
    if (this.accountProfile.emails) {
      this.emailId = this.accountProfile.emails[0];
    }
    if (this.accountProfile.phoneNumbers) {
      this.phoneNo = this.accountProfile.phoneNumbers[0];
    }
    if (this.accountProfile.baseLocation.place) {
      this.location = this.accountProfile.baseLocation.place;      
    } 
    if (this.accountProfile.businessDesc) {
      this.businessDesc = this.accountProfile.businessDesc;
    }   
    if (this.accountProfile.specialization) {
        this.specialities = this.accountProfile.specialization;
    }
  }
}

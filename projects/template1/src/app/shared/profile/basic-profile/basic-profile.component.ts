import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { projectConstantsLocal } from 'jconsumer-shared';

@Component({
  selector: 'app-basic-profile',
  templateUrl: './basic-profile.component.html',
  styleUrls: ['./basic-profile.component.css']
})
export class BasicProfileComponent implements OnInit {
  
  @Input() profile;
  @Input() selectedLocation;
  @Input() extras;
  @Output() actionPerformed = new EventEmitter<any>();
  emailId: any;
  phoneNo: any;
  location: any;
  basicProfile = {};
  orgsocial_list = projectConstantsLocal.SOCIAL_MEDIA_CONSUMER;

  constructor() { }

  ngOnInit(): void {
    console.log(this.profile);
    if (this.profile.emails) {
      this.emailId = this.profile.emails[0];
    }
    if (this.profile.phoneNumbers) {
      this.phoneNo = this.profile.phoneNumbers[0];
    }
    if (this.profile.baseLocation && this.profile.baseLocation.place) {
      this.location = this.profile.baseLocation.place;      
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
  goHome() {
    this.actionPerformed.emit('about');
  }

  communicateHandler() {
    this.actionPerformed.emit('communicate');
  }

  qrCodegeneraterOnlineID() {
    this.actionPerformed.emit('qrcode');
  }

  openCoupons() {
    this.actionPerformed.emit('coupons');
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { projectConstantsLocal, SharedService } from 'jconsumer-shared';
import { imageConstants } from '../../image-constants';

@Component({
  selector: 'app-basic-profile-new',
  templateUrl: './basic-profile-new.component.html',
  styleUrls: ['./basic-profile-new.component.scss']
})
export class BasicProfileNewComponent implements OnInit {
  @Input() profile;
  @Input() selectedLocation;
  @Input() extras;
  emailId: any;
  phoneNo: any;
  orgsocial_list = projectConstantsLocal.SOCIAL_MEDIA_CONSUMER;
  cdnPath: string;
  constructor(private sharedService: SharedService) {
    console.log("Basic Profile New Constructor");

  }
  @Output() actionPerformed = new EventEmitter<any>();
  ngOnInit(): void {
    if (this.profile.emails) {
      this.emailId = this.profile.emails[0];
    }
    if (this.profile.phoneNumbers) {
      this.phoneNo = this.profile.phoneNumbers[0];
    }
    this.cdnPath = this.sharedService.getCDNPath();
  }
  getSocialdet(key, field) {
    const retdet = this.orgsocial_list.filter(
      soc => soc.key === key);
    let returndet = '';
    if (retdet && retdet[0] && retdet[0][field]) {
      let returndet = retdet[0][field];
      if (returndet === 'BizyGlobe') {
        returndet = 'bizyGlobe';
      }
      return returndet;
    }
    return returndet;
  }
  getSocialIcon(key) {
    if (!imageConstants[key]) {
      return '';
    } else {
      return (this.cdnPath + imageConstants[key]);
    }
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
  donationClicked() {
    this.actionPerformed.emit('donation');
  }
}

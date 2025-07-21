import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-basic-profile-first',
  templateUrl: './basic-profile-first.component.html',
  styleUrls: ['./basic-profile-first.component.scss']
})
export class BasicProfileFirstComponent implements OnInit {

  @Input() businessProfile;
  @Input() templateJson;
  @Input() selectedLocation;
  @Input() customId;
  emailId: any;
  phoneNo: any;
  location: any;
  @Output() actionPerformed = new EventEmitter<any>();


  constructor(
    private router: Router,
    public translate: TranslateService
  ) { }

  ngOnInit(): void {
    console.log("businessProfile", this.customId);
    console.log("templateJson", this.templateJson);
    console.log("selectedLocation", this.selectedLocation);
    if (this.businessProfile.emails) {
      this.emailId = this.businessProfile.emails[0];
    }
    if (this.businessProfile.phoneNumbers) {
      this.phoneNo = this.businessProfile.phoneNumbers[0];
    }
    if (this.businessProfile.baseLocation.place) {
      this.location = this.businessProfile.baseLocation.place;
    }
  }
  goHome() {
    this.actionPerformed.emit('about');
    this.router.navigate([this.customId, 'about']);
  }

}

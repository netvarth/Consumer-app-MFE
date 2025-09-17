import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-membership-services',
  templateUrl: './membership-services.component.html',
  styleUrls: ['./membership-services.component.scss']
})
export class MembershipServicesComponent implements OnInit {
  @Input() memberService;
  @Input() accountProfile;
  @Output() actionPerformed = new EventEmitter<any>();
  memberService_arr: any;
  cdnPath: string;
  // accEncUid: any;
  constructor(
    private router: Router,
    private sharedService: SharedService
  ) { 
    this.cdnPath =this.sharedService.getCDNPath();
  }  
  ngOnInit(): void {
    if (this.memberService && (this.accountProfile && this.accountProfile.accEncUid)){
      this.memberService_arr = this.memberService;
      // this.accEncUid = this.accountProfile.accEncUid;
    }
  }
memberEnroll(serviceId){
  this.router.navigateByUrl(this.sharedService.getRouteID() + '/membership/' + serviceId);
}
}

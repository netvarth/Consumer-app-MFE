import { Component, Input, OnInit } from '@angular/core';
import { projectConstantsLocal, SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-service-info-display',
  templateUrl: './service-info-display.component.html',
  styleUrls: ['./service-info-display.component.css']
})
export class ServiceInfoDisplayComponent implements OnInit {
  @Input() selectedService;
  @Input() selectedApptsTime;
  @Input() appmtDate;
  @Input() isFutureDate;
  @Input() datePresent;
  @Input() userInfo;
  servicetype: any;
  cdnPath: string = '';
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  constructor(private sharedService: SharedService) { 
    this.cdnPath = this.sharedService.getCDNPath();
  }

  ngOnInit(): void {
    console.log("selectdERVICE", this.selectedService)
    if (this.selectedService.virtualServiceType) {
      this.servicetype = this.selectedService.virtualServiceType;
    } else if (this.selectedService.serviceType) {
      this.servicetype = this.selectedService.serviceType;
    }
  }

}

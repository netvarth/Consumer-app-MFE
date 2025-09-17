import { Component, Input } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-service-info',
  templateUrl: './service-info.component.html',
  styleUrl: './service-info.component.scss'
})
export class ServiceInfoComponent {

  @Input() service;
  @Input() booking;
  cdnPath: string = '';
  constructor(private sharedService: SharedService) {
    this.cdnPath = this.sharedService.getCDNPath();
  }
}

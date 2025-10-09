import { Component, Input } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-service-image',
  templateUrl: './service-image.component.html',
  styleUrl: './service-image.component.scss'
})
export class ServiceImageComponent {

  @Input() booking;
  cdnPath: string = '';
  constructor(private sharedService: SharedService) {
    this.cdnPath = this.sharedService.getCDNPath();
  }
}

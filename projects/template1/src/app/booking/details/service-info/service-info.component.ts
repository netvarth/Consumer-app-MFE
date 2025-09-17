import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-service-info',
  templateUrl: './service-info.component.html',
  styleUrl: './service-info.component.scss'
})
export class ServiceInfoComponent {
  
  @Input() booking;

  constructor() {}

}

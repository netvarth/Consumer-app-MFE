import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-location-card',
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.scss']
})
export class LocationCardComponent implements OnInit {

  @Input() item: any;
  cdnPath: string = '';
  constructor(private sharedService: SharedService) {
    this.cdnPath = this.sharedService.getCDNPath();
  }

  ngOnInit(): void {
  }

}

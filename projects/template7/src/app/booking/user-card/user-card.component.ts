import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit {

  @Input() user: any;
  cdnPath: string = '';
  constructor(private sharedService: SharedService) { 
    this.cdnPath = this.sharedService.getCDNPath();
  }

  ngOnInit(): void {
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-department-card',
  templateUrl: './department-card.component.html',
  styleUrls: ['./department-card.component.scss']
})
export class DepartmentCardComponent implements OnInit {

  @Input() item: any;
  cdnPath: string = '';
  constructor(private sharedService: SharedService) {
    this.cdnPath = this.sharedService.getCDNPath();
   }

  ngOnInit(): void {
  }

}

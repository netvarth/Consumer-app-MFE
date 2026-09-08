import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-department-card',
  templateUrl: './department-card.component.html',
  styleUrls: ['./department-card.component.css']
})
export class DepartmentCardComponent implements OnInit {

  @Output() actionPerformed = new EventEmitter<any>();
  @Input() item: any;
  @Input() terminology: any;
  @Input() theme: any;
  @Input() loc: any;
  @Input() domain: any;
  @Input() type: any;
  department: any;
  cdnPath: string;
  
  constructor(private sharedService: SharedService) { 
    this.cdnPath = this.sharedService.getCDNPath();
  }

  ngOnInit(): void {
    this.department = this.item.item;
  }
  
  cardActionPerformed(type: any, action: any, service: any, location: any, userId: any, event: any, item?: any) {
    event.stopPropagation();
    const actionObj: any = {};
    if (item) {
        item['loading'] = true;
        actionObj['item'] = item;
    }
    actionObj['type'] = type;
    actionObj['action'] = action;
    if (service) {
        actionObj['service'] = service;
    }

    if (location) {
        actionObj['location'] = location;
    }
    if (userId) {
        actionObj['userId'] = userId;
    }
    //if (item)
    
    this.actionPerformed.emit(actionObj);
}
}

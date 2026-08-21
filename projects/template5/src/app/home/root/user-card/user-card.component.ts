import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {

  @Output() actionPerformed = new EventEmitter<any>();
  @Input() theme: any;
  @Input() item: any;
  @Input() cardType: any;
  user: any;

  constructor(
    public translate: TranslateService
  ) { 
    this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
  }

  ngOnInit(): void {
    this.user = this.item.item;
  }
  getPic(user: any) {
    if (user.profilePicture) {
      return user.profilePicture['url'];
    }
    return null;
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
    this.actionPerformed.emit(actionObj);
  }
}

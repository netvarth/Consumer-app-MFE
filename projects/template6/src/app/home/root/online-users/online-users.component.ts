import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-online-users',
  templateUrl: './online-users.component.html',
  styleUrls: ['./online-users.component.css']
})
export class OnlineUsersComponent implements OnInit {
  
  @Input() selectedLocation;
  @Input() terminologiesjson;
  @Input() theme;
  @Input() users;
  @Input() accountProfile;
  @Input() cardType;
  @Output() actionPerformed = new EventEmitter<any>();
  constructor() {
   }
  ngOnInit(): void {
  }
  cardClicked(actionObj) {
    this.actionPerformed.emit(actionObj);
  }
}

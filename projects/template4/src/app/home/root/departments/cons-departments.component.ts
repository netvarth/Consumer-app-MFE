import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-cons-departments',
  templateUrl: './cons-departments.component.html',
  styleUrls: ['./cons-departments.component.css']
})
export class ConsDepartmentsComponent implements OnInit {

  @Input() selectedLocation;
  @Input() terminologiesjson;
  @Input() theme;
  @Input() accountProfile;
  @Input() departments;
  @Input() cardType;
  @Output() actionPerformed = new EventEmitter<any>();
  constructor(
    ) { }

  ngOnInit(): void {
  }

  cardClicked(actionObj) {
    this.actionPerformed.emit(actionObj);
  }
}

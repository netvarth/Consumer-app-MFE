import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-checkin-services',
  templateUrl: './checkin-services.component.html',
  styleUrls: ['./checkin-services.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CheckinServicesComponent implements OnInit, OnChanges {
  @Input() selectedLocation;
  @Input() terminologiesjson;
  @Input() theme;
  @Input() accountProfile;
  @Input() filteredServices;
  @Input() cardName;
  services;
  @Output() actionPerformed = new EventEmitter<any>();
  constructor() { }
  ngOnInit(): void {
  }
  ngOnChanges(): void {
    this.services = this.filteredServices;
  }
  cardClicked(actionObj) {
    this.actionPerformed.emit(actionObj);
  }
}

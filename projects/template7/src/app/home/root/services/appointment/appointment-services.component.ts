import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-appointment-services',
  templateUrl: './appointment-services.component.html',
  styleUrls: ['./appointment-services.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppointmentServicesComponent implements OnInit, OnChanges {
  @Input() selectedLocation;
  @Input() terminologiesjson;
  @Input() theme;
  @Input() accountProfile;
  @Input() filteredServices;
  @Input() config;
  @Input() cardName;
  @Output() actionPerformed = new EventEmitter<any>();
  services;
  constructor() { }

  ngOnInit(): void {
    this.services = this.filteredServices;
  }

  ngOnChanges(): void {
    this.services = this.filteredServices;
  }

  cardClicked(actionObj) {
    console.log("Action:",actionObj);
    this.actionPerformed.emit(actionObj);
  }
}

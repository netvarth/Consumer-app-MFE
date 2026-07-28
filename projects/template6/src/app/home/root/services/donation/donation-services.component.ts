import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-donation-services',
  templateUrl: './donation-services.component.html',
  styleUrls: ['./donation-services.component.css']
})
export class DonationServicesComponent implements OnInit {
  @Input() selectedLocation;
  @Input() terminologiesjson;
  @Input() theme;
  @Input() accountProfile;
  @Input() donationServices;
  @Input() cardType;
  @Output() actionPerformed = new EventEmitter<any>();
  constructor() { }
  ngOnInit(): void {
  }
  cardClicked(actionObj) {
    this.actionPerformed.emit(actionObj);
  }
}

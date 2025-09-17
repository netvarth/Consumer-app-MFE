import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-location-selection',
  templateUrl: './location-selection.component.html',
  styleUrls: ['./location-selection.component.scss']
})
export class LocationSelectionComponent implements OnInit {

  selectedLocationId;// Id of the appointment service
  locations;
  selectedLocation;
  @Output() locationSelected = new EventEmitter<any>();
  @Output() actionPerformed = new EventEmitter<any>();

  constructor(
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.locations = this.bookingService.getLocations();
    this.selectedLocation = this.bookingService.getSelectedLocation();
    if(this.selectedLocation) {
      this.selectedLocationId =this.selectedLocation.id;
    }  
  }
  goBack() {
    this.actionPerformed.emit({ 'action': 'back' });
  }
  goToStep() {
    this.actionPerformed.emit({ 'action': 'next' });
  }
  locationClicked(activeLocation) {
    this.selectedLocation = activeLocation;
    this.locationSelected.emit(this.selectedLocation);
    this.goToStep();
  }
}

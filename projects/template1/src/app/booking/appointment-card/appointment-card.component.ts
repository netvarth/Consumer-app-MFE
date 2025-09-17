import { Component, Input, OnInit } from '@angular/core';
import { DateTimeProcessor, GroupStorageService, LocalStorageService, Messages, SharedService, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-appointment-card',
  templateUrl: './appointment-card.component.html',
  styleUrls: ['./appointment-card.component.scss']
})
export class AppointmentCardComponent implements OnInit {

  @Input() item: any;
  @Input() config: any;
  buttonCaption = Messages.GET_TOKEN;
  personsAheadText = '';
  personsAheadCaption = '';
  timingCaption: string = '';
  timings: string = '';
  server_date: any;
  service: any;
  percentage_symbol = '%';
  isInternational = false;
  loggedInUser: any;
  consumer_label: any;
  cdnPath: string = '';
  constructor(
    private dateTimeProcessor: DateTimeProcessor,
    private lStorageService: LocalStorageService,
    private wordProcessor: WordProcessor,
    private sharedService: SharedService,
    private groupService: GroupStorageService) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.server_date = this.lStorageService.getitemfromLocalStorage('sysdate');
  }

  ngOnInit(): void {
    this.consumer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.loggedInUser = this.groupService.getitemFromGroupStorage('jld_scon');
    if (this.loggedInUser && this.loggedInUser.countryCode !== '+91') {
      this.isInternational = true;
    }
    this.service = this.item;
    this.timingCaption = 'Next Available Time';
    if (this.service && this.service.serviceAvailability) {
      this.timings = this.getAvailabilityforAppt(this.service.serviceAvailability.nextAvailableDate, this.service.serviceAvailability.nextAvailable);
    }
    if (this.service.serviceBookingType === 'request') {
      this.buttonCaption = 'Request';
    }
    else {
      let buttonTitle = this.getTerminologyFromConfig('get_appointment');
      this.buttonCaption = ((buttonTitle !== null) ? buttonTitle : 'Get Appointment');
    }
  }
  getAvailabilityforAppt(date: any, time: any) {
    return (this.dateTimeProcessor.formatDate(date, { 'rettype': 'monthname' }) + ', '
      + this.getSingleTime(time));
  }
  getSingleTime(slot: any) {
    const slots = slot.split('-');
    return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
  }
  getAvailableSlot(slots: any) {
    let slotAvailable = '';
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].active) {
        slotAvailable = this.getSingleTime(slots[i].time);
        break;
      }
    }
    return slotAvailable;
  }
  getTerminologyFromConfig(term: any) {
    if (this.config && this.config.terminologies && this.config.terminologies[term]) {
      return this.config.terminologies[term];
    }
    return null;
  }
}

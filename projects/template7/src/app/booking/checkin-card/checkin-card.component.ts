import { Component, Input, OnInit } from '@angular/core';
import { DateTimeProcessor, GroupStorageService, LocalStorageService, Messages, SharedService, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-checkin-card',
  templateUrl: './checkin-card.component.html',
  styleUrls: ['./checkin-card.component.scss']
})
export class CheckinCardComponent implements OnInit {

  @Input() item: any;
  @Input() config: any;
  @Input() terminology: any;
  server_date: any;
  service: any;
  timingCaption: string = '';
  timings: string = '';
  buttonCaption = Messages.GET_TOKEN;
  personsAheadText = '';
  personsAheadCaption = '';
  percentage_symbol = '%';
  isInternational: boolean = false;
  loggedInUser: any;
  consumer_label: any;
  cdnPath: string = '';
  constructor(private dateTimeProcessor: DateTimeProcessor,
    private wordProcessor: WordProcessor,
    private groupService: GroupStorageService,
    private sharedService: SharedService,
    private lStorageService: LocalStorageService) {
      this.cdnPath = this.sharedService.getCDNPath();
    this.server_date = this.lStorageService.getitemfromLocalStorage('sysdate');
  }

  ngOnInit(): void {
    this.loggedInUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.consumer_label = this.wordProcessor.getTerminologyTerm('customer');
    if (this.loggedInUser && this.loggedInUser.countryCode!=='+91') {
      this.isInternational = true;
    }
    this.service = this.item;
    if (this.service && this.service.serviceAvailability) {
      if (this.service.serviceAvailability['personAhead'] >= 0) {
        this.personsAheadCaption = "People in line";
        this.personsAheadText = this.service.serviceAvailability['personAhead'];
      }
      if (this.service.serviceAvailability['showToken']) {
      } else {
        this.buttonCaption = 'Get ' + this.getTerminologyTerm('waitlist');
      }
      if (this.service.serviceAvailability['calculationMode'] !== 'NoCalc') {
        if (this.service.serviceAvailability['serviceTime']) {
          this.timingCaption = 'Next Available Time';
          this.timings = this.getAvailibilityForCheckin(this.service.serviceAvailability['availableDate'], this.service.serviceAvailability['serviceTime']);
        } else {
          this.timingCaption = 'Est Wait Time';
          this.timings = this.getTimeToDisplay(this.service.serviceAvailability['queueWaitingTime']);
        }
      }
    }
    // if (this.timings === '' && this.personsAheadText === '') {
    //   this.cardType = "card_1";
    // }
  }
  getTerminologyTerm(term: any) {
    const term_only = term.replace(/[\[\]']/g, ''); // term may me with or without '[' ']'
    if (this.terminology) {
      return this.wordProcessor.firstToUpper((this.terminology[term_only]) ? this.terminology[term_only] : ((term === term_only) ? term_only : term));
    } else {
      return this.wordProcessor.firstToUpper((term === term_only) ? term_only : term);
    }
  }
  getTimeToDisplay(min: any) {
    return this.dateTimeProcessor.convertMinutesToHourMinute(min);
  }
  getAvailibilityForCheckin(date: any, serviceTime: any) {
    // const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
    // const today = new Date(todaydt);
    // const dd = today.getDate();
    // const mm = today.getMonth() + 1; // January is 0!
    // const yyyy = today.getFullYear();
    // let cday = '';
    // if (dd < 10) {
    //   cday = '0' + dd;
    // } else {
    //   cday = '' + dd;
    // }
    // let cmon;
    // if (mm < 10) {
    //   cmon = '0' + mm;
    // } else {
    //   cmon = '' + mm;
    // }
    // const dtoday = yyyy + '-' + cmon + '-' + cday;
    // if (dtoday === date) {
    //   return ('Today' + ', ' + serviceTime);
    // } else {
      return (this.dateTimeProcessor.formatDate(date, { 'rettype': 'monthname' }) + ', '
        + serviceTime);
    }
  // }
}

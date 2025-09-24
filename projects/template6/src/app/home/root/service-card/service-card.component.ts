import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe, DateTimeProcessor, LocalStorageService, Messages, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.css']
})
export class ServiceCardComponent implements OnInit {

  @Input() item: any;
  @Input() terminology: any;
  @Input() theme: any;
  @Input() loc: any;
  @Input() domain: any;
  @Input() type: any;
  @Output() actionPerformed = new EventEmitter<any>();
  service: any;
  buttonCaption = Messages.GET_TOKEN;
  personsAheadText = '';
  personsAheadCaption = '';
  timingCaption: string = '';
  timings: string = '';
  customer_label = '';
  todayDate: any;
  server_date;
  waitlist: any;
  appointment: any;
  @Input() config: any;
  
  constructor(
    public translate: TranslateService,
    private wordProcessor: WordProcessor,
    private datePipe: DateFormatPipe,
    private dateTimeProcessor: DateTimeProcessor,
    private lStorageService: LocalStorageService
  ) {
    this.server_date = this.lStorageService.getitemfromLocalStorage('sysdate');
  }

  ngOnInit(): void {
    this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    console.log(this.item);
    this.service = this.item.item;
    console.log(this.service);
   
    if (this.type) {
      this.item.type = this.type;
    }
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.todayDate = this.datePipe.transformTofilterDate(new Date());
    switch (this.item.type) {
      case 'waitlist':
        console.log("Waitlist Service: ", this.service);
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
        break;
      case 'appt':
        console.log("Appt Service: ", this.service);
        console.log("Appointment Info :", this.service)
        this.timingCaption = 'Next Available Time';
        this.timings = this.getAvailabilityforAppt(this.service.serviceAvailability.nextAvailableDate, this.service.serviceAvailability.nextAvailable);
        if (this.service.serviceBookingType === 'request') {
          this.buttonCaption = 'Request';
        }
        else {
          let buttonTitle = this.getTerminologyFromConfig('get_appointment');
          console.log("Button Caption:", buttonTitle);
          this.buttonCaption = ((buttonTitle !== null) ? buttonTitle : 'Get Appointment');
        }
        console.log("Timings:", this.timings);
        console.log("Person ahead:", this.personsAheadText);
        // if (this.timings !== '' && this.personsAheadText !== '') {
        //     this.cardType="card_1";
        // }        
        break;
      // case 'donation':
      //     this.service = this.item.item;
      //     this.buttonCaption = 'Donate';
      //     break;
      // case 'catalog':
      //     this.service = this.item.item;
      //     break;
      // case 'item':
      //     this.service = this.item.item;
      //     break;
      // case 'pitem':
      //     this.service = this.item.item;
      //     this.actions = this.extras;
      //     break;
      // case 'order-details-item':
      //     this.service = this.item.item;
      //     break;
      // case 'item-head':
      //     break;
      // case 'checkin-dashboard':
      //     this.waitlist = this.item;
      //     break;
      // case 'appt-dashboard':
      //     this.waitlist = this.item;
      //     break;
      // case 'department':
      //     this.department = this.item.item;
      //     console.log("This department", this.department);
      //     break;
      default:
        break;
    }
  }
  getTimeToDisplay(min: any) {
    return this.dateTimeProcessor.convertMinutesToHourMinute(min);
}
  getTerminologyFromConfig(term: any) {
    if(this.config && this.config.terminologies && this.config.terminologies[term]) {
        return this.config.terminologies[term];
    }
    return null; 
}
  getAvailibilityForCheckin(date: any, serviceTime: any) {
    // const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
    // const today = new Date(todaydt);
    // const dd = today.getDate();
    // const mm = today.getMonth() + 1; // January is 0!
    // const yyyy = today.getFullYear();
    // let cday = '';
    // if (dd < 10) {
    //     cday = '0' + dd;
    // } else {
    //     cday = '' + dd;
    // }
    // let cmon;
    // if (mm < 10) {
    //     cmon = '0' + mm;
    // } else {
    //     cmon = '' + mm;
    // }
    // const dtoday = yyyy + '-' + cmon + '-' + cday;
    // if (dtoday === date) {
    //     return ('Today' + ', ' + serviceTime);
    // } else {
        return (this.dateTimeProcessor.formatDate(date, { 'rettype': 'monthname' }) + ', '
            + serviceTime);
    // }
}
  getTerminologyTerm(term: any) {
    const term_only = term.replace(/[\[\]']/g, ''); // term may me with or without '[' ']'
    console.log(this.terminology);
    if (this.terminology) {
      return this.wordProcessor.firstToUpper((this.terminology[term_only]) ? this.terminology[term_only] : ((term === term_only) ? term_only : term));
    } else {
      return this.wordProcessor.firstToUpper((term === term_only) ? term_only : term);
    }
  }
  getTimeMinute(time: any) {
    let hr;
    let min;
    if (time >= 60) {
      hr = Math.floor(time / 60);
      min = Math.floor(time % 60);
      return 'delayed by ' + hr + 'hr' + ':' + min + 'mins';
    }
    if (time < 60) {
      min = Math.floor(time % 60);
      return 'delayed by ' + min + 'mins';
    }
    return '';
  }
  getAvailabilityforAppt(date: any, time: any) {
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
    //   return ('Today' + ', ' + this.getSingleTime(time));
    // } else {
      return (this.dateTimeProcessor.formatDate(date, { 'rettype': 'monthname' }) + ', '
        + this.getSingleTime(time));
    // }
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

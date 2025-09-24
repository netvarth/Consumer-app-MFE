import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { BookingService } from '../booking.service';
import { DateTimeProcessor, LocalStorageService, SharedService } from 'jconsumer-shared';
import { imageConstants } from '../../shared/image-constants';

@Component({
  selector: 'app-date-time-selection',
  templateUrl: './date-time-selection.component.html',
  styleUrls: ['./date-time-selection.component.scss']
})
export class DateTimeSelectionComponent implements OnInit {

  availableDates: any = []; // to show available appointment dates in calendar
  bookingType: any;
  allSlots: any;
  slotLoaded;
  isAvailableDatesLoaded = false;
  selectedService: any;
  selectedUser;
  isFutureDate;
  selectedApptsTime;
  bookingDate;
  @Input() paymentRequestId;
  @Output() actionPerformed = new EventEmitter<any>();
  serverDate: any;
  moment;
  selectedSlots: any[];
  isSlotAvailable: any;
  queuesLoaded;
  sel_queue_id;
  queueId;
  sel_queue_waitingmins;
  waitingTime;
  sel_queue_servicetime = '';
  serviceTime;
  sel_queue_name;
  sel_queue_timecaption;
  sel_queue_indx;
  sel_queue_personaahead = 0;
  personsAhead;
  calc_mode;
  wt_personaahead;
  selectedQTime;
  queuejson: any = [];
  HHMM: string;
  percentage_symbol = '%';
  cdnPath: string = '';
  constructor(
    private bookingService: BookingService,
    private dateTimeProcessor: DateTimeProcessor,
    private lStorageService: LocalStorageService,
    private sharedService: SharedService
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.moment = this.dateTimeProcessor.getMoment();
  }

  ngOnInit(): void {
    const _this = this;
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.selectedService = this.bookingService.getSelectedService();
    this.selectedUser = this.bookingService.getSelectedUser();
    if (this.selectedService.provider && !this.selectedUser) {
      let users = this.bookingService.getUsers();
      let selectedUser = users.filter(user => user.id == this.selectedService.provider.id);
      if (selectedUser.length > 0) {
        this.selectedUser = selectedUser[0];
      }
    } 
    this.bookingDate = this.bookingService.getBookingDate();
    this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.bookingDate);
    if (this.selectedService.bType === 'Appointment') {      
      _this.bookingService.getSchedulesbyLocationandServiceIdavailability(this.bookingService.getLocationId(), this.selectedService.id, this.bookingService.getAccountId()).then(
        (slots: any) => {
          _this.availableDates = slots;
          _this.isAvailableDatesLoaded  =true;
        }
      );     
    } else {
      this.isAvailableDatesLoaded  =true;
      this.bookingService.getQueuesbyLocationServiceAndDate(this.bookingService.getLocationId(), this.selectedService.id, this.bookingDate, this.bookingService.getAccountId())
        .then((queues: any) => {
          _this.queuejson = queues;
          _this.queuesLoaded = true;
          _this.setQDetails(queues);
        });
    }
    this.getDuration(this.selectedService);
  }
  setImagePathStyle(key) {
    return {
      'background': `url(${this.sharedService.getCDNPath() + imageConstants[key]}) no-repeat left`
    };
  }
  getDuration(servicedetails: any) {
    let minutes = servicedetails.serviceDuration;
    if (minutes) {
      let min = minutes % 60;
      let hour = (minutes - min) / 60;
      if (hour > 0 && min > 0) {
        if (hour > 1) {
          this.HHMM = hour + ' ' + 'hrs' + ' ' + min + ' ' + 'mins';
        } else {
          this.HHMM = hour + ' ' + 'hr' + ' ' + min + ' ' + 'mins';
        }
      } else if (hour === 0) {
        this.HHMM = min + ' ' + 'mins';
      } else if (min === 0) {
        if (hour > 1) {
          this.HHMM = hour + ' ' + 'hrs';
        } else {
          this.HHMM = hour + ' ' + 'hr';
        }
      }
    }
  }
  dateClass(date: Date): MatCalendarCellCssClasses {
    return (this.availableDates.indexOf(this.moment(date).format('YYYY-MM-DD')) !== -1) ? 'example-custom-date-class' : '';
  }
  goBack() {
    this.actionPerformed.emit({ 'action': 'back' });
  }
  goToStep() {
    this.actionPerformed.emit({ 'action': 'next' });
  }
  bookingDateChanged(date) {
    const _this = this;
    this.queuejson = [];
    this.bookingDate = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(new Date(date));
    this.bookingService.setBookingDate(this.bookingDate);
    this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.bookingDate);
    this.slotLoaded = false;
    this.queuesLoaded = false;
    if (this.selectedService.bType === 'Appointment') {
      this.getAvailableSlotByLocationandService(this.bookingService.getLocationId(), this.selectedService.id, this.bookingDate, this.bookingService.getAccountId());
    } else {
      this.bookingService.getQueuesbyLocationServiceAndDate(this.bookingService.getLocationId(), this.selectedService.id, this.bookingDate, this.bookingService.getAccountId())
        .then((queues: any) => {
          _this.queuejson = queues;
          _this.queuesLoaded = true;
          _this.setQDetails(queues);
        });
    }
  }
  bookingMonthChanged(event) {
    let year = event.year;
    let month = event.month;
    this.bookingService. getSchedulesbyMonthandServiceIdavailability(this.bookingService.getLocationId(), this.selectedService.id, month, year,  this.bookingService.getAccountId()).then(
    (slots: any) => {
      this.availableDates = slots;
      this.isAvailableDatesLoaded  =true;
    });
}
  getAvailableSlotByLocationandService(locid, servid, appmtDate, accountid, type?) {
    const _this = this;
    _this.selectedSlots = [];
    this.slotLoaded = false;
    const showOnlyAvailable = _this.selectedService.showOnlyAvailableSlots;
    _this.isSlotAvailable = showOnlyAvailable;
    _this.bookingService.getSlotsByLocationServiceandDate(locid, servid, appmtDate, accountid)
      .subscribe((data: any) => {
        _this.allSlots = [];
        _this.slotLoaded = true;
        for (const scheduleSlots of data) {
          const availableSlots = scheduleSlots.availableSlots;
          for (const slot of availableSlots) {
            if (showOnlyAvailable && !slot.active) {
            } else {
              slot['date'] = scheduleSlots['date'];
              slot['scheduleId'] = scheduleSlots['scheduleId'];
              slot['displayTime'] = _this.getSingleTime(slot.time);
              _this.allSlots.push(slot);
            }
          }
        }
        const availableSlots = _this.allSlots.filter(slot => slot.active);
        if (availableSlots && availableSlots.length > 0) {
          _this.isSlotAvailable = true;
        }
        const timetosel = _this.allSlots.filter(slot => slot.active);
        if (timetosel && timetosel.length > 0) {
          let apptTimes = [];
          apptTimes.push(timetosel[0]);
          _this.slotSelected(apptTimes);
        }
      });
  }
  qSelected(slot) {
      this.selectedQTime = slot.queueSchedule.timeSlots[0]['sTime'] + ' - ' + slot.queueSchedule.timeSlots[0]['eTime'];
      this.personsAhead = slot.queueSize;
      this.waitingTime = this.dateTimeProcessor.convertMinutesToHourMinute(slot.queueWaitingTime);
      this.serviceTime = slot.serviceTime || '';
      this.queueId = slot.id;
      this.actionPerformed.emit({ 'action': 'setQ', 'selectedQ': this.queueId, 'selectedQTime': this.selectedQTime });
  }
  slotSelected(slots) {
    const _this = this;
    _this.selectedSlots = slots;
    const apptTimings = _this.selectedSlots.filter(obj => obj.time);
    const apptTimings1 = apptTimings.map(function (a) { return _this.getSingleTime(a.time) });
    _this.selectedApptsTime = apptTimings1.join(', ');
    this.bookingService.setTimings(_this.selectedApptsTime);
    this.actionPerformed.emit({ 'action': 'setTimings', 'selectedSlots': _this.selectedSlots });
  }
  getSingleTime(slot) {
    const slots = slot.split('-');
    return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
  }
  setQDetails(queues, qId?) {
    if (queues.length > 0) {
      let selindx = 0;
      for (let i = 0; i < queues.length; i++) {
        if (queues[i]['queueWaitingTime'] !== undefined) {
          selindx = i;
        }
      }
      this.sel_queue_id = queues[selindx].id;
      this.sel_queue_indx = selindx;
      this.sel_queue_waitingmins = this.dateTimeProcessor.providerConvertMinutesToHourMinute(queues[selindx].queueWaitingTime);
      this.sel_queue_servicetime = queues[selindx].serviceTime || '';
      this.sel_queue_name = queues[selindx].name;
      this.sel_queue_personaahead = queues[selindx].queueSize;
      this.wt_personaahead = queues[selindx].showPersonAhead;
      this.calc_mode = queues[selindx].calculationMode;
      this.qSelected(queues[selindx]);
    } else {
      this.sel_queue_id = 0;
      this.sel_queue_waitingmins = 0;
      this.sel_queue_servicetime = '';
      this.sel_queue_name = '';
      this.sel_queue_personaahead = 0;
    }
  }
}

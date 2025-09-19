import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeProcessor } from 'jconsumer-shared';
import * as momentTZ from 'moment-timezone';

@Component({
  selector: 'app-date-pagination',
  templateUrl: './date-pagination.component.html',
  styleUrls: ['./date-pagination.component.css']
})
export class DatePaginationComponent implements OnInit {
  @Output() date_change_event = new EventEmitter<any>();
  @Input() selected_date;
  @Input() availableDates;
  minDate: any;
  maxDate: any;
  // selected_date: any;
  default_value: String;
  next_date_value: string;
  next_date_value_1: string;
  next_date_value_2: string;
  month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  prev_date_value: string;
  prev_date_value_1: string;
  prev_date_value_2: string;
  previous_date_handling_btn: boolean;
  moment: any;
  timezone: any;
  constructor(private dateTimeProcessor: DateTimeProcessor,
    public translate: TranslateService) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  ngOnInit(): void {
    // console.log("Selected Date:", this.selected_date);
    this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.minDate = momentTZ.tz(new Date(), this.timezone).toDate();
    this.maxDate = new Date((this.minDate.getFullYear() + 4), 12, 31);
    this.minDate = this.moment(this.minDate).format("YYYY-MM-DD");
    // console.log(this.minDate);
    this.previous_date_handling_btn = false;
    // if (this.type == "waitlistreschedule") {
    //   this.sel_checkindate = this.hold_checkindate
    // }
    // let today_date1 = new Date(this.selected_date);
    let today_date1 = momentTZ.tz(this.selected_date, this.timezone).toDate(); // Convert to Date object

    this.default_value = this.week[today_date1.getDay()] + this.month[today_date1.getMonth()] + today_date1.getDate();
    today_date1.setDate(today_date1.getDate() + 1);
    this.next_date_value = this.week[today_date1.getDay()] + this.month[today_date1.getMonth()] + today_date1.getDate();
    today_date1.setDate(today_date1.getDate() + 1);
    this.next_date_value_1 = this.week[today_date1.getDay()] + this.month[today_date1.getMonth()] + today_date1.getDate();
    today_date1.setDate(today_date1.getDate() + 1);
    this.next_date_value_2 = this.week[today_date1.getDay()] + this.month[today_date1.getMonth()] + today_date1.getDate();
    today_date1.setDate(today_date1.getDate() - 4);
    this.prev_date_value = this.week[today_date1.getDay()] + this.month[today_date1.getMonth()] + today_date1.getDate();
    today_date1.setDate(today_date1.getDate() - 1);
    this.prev_date_value_1 = this.week[today_date1.getDay()] + this.month[today_date1.getMonth()] + today_date1.getDate();
    today_date1.setDate(today_date1.getDate() - 1);
    this.prev_date_value_2 = this.week[today_date1.getDay()] + this.month[today_date1.getMonth()] + today_date1.getDate();
    if (this.selected_date) {
      this.date_change_event.emit(this.selected_date);
    }

    this.date_handling_btn()
  }

  next_date(n) {    
    console.log("Selected Date:", this.selected_date);
    let tommorow = momentTZ.tz(this.selected_date, this.timezone).toDate();
    console.log("Tommorow Date:", this.selected_date);
    tommorow.setDate(tommorow.getDate() + n);
    this.default_value = this.week[tommorow.getDay()] + this.month[tommorow.getMonth()] + tommorow.getDate();
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(new Date(tommorow));
    // this.selectedDate = this.sel_checkindate;
    tommorow.setDate(tommorow.getDate() + 1);
    this.next_date_value = this.week[tommorow.getDay()] + this.month[tommorow.getMonth()] + tommorow.getDate();
    tommorow.setDate(tommorow.getDate() + 1);
    this.next_date_value_1 = this.week[tommorow.getDay()] + this.month[tommorow.getMonth()] + tommorow.getDate();
    tommorow.setDate(tommorow.getDate() + 1);
    this.next_date_value_2 = this.week[tommorow.getDay()] + this.month[tommorow.getMonth()] + tommorow.getDate();
    tommorow.setDate(tommorow.getDate() - 4);
    this.prev_date_value = this.week[tommorow.getDay()] + this.month[tommorow.getMonth()] + tommorow.getDate();
    tommorow.setDate(tommorow.getDate() - 1);
    this.prev_date_value_1 = this.week[tommorow.getDay()] + this.month[tommorow.getMonth()] + tommorow.getDate();
    tommorow.setDate(tommorow.getDate() - 1);
    this.prev_date_value_2 = this.week[tommorow.getDay()] + this.month[tommorow.getMonth()] + tommorow.getDate();
    console.log("Result Date:", this.selected_date);
    this.date_change_event.emit(this.selected_date);
    this.date_handling_btn()
  }
  prev_date(n) {    
    console.log("this.timezone",this.timezone,this.selected_date)
    let yesterday = momentTZ.tz(this.selected_date, this.timezone).toDate();
    yesterday.setDate(yesterday.getDate() - n);
    console.log("yesterday",yesterday),
    this.default_value = this.week[yesterday.getDay()] + this.month[yesterday.getMonth()] + yesterday.getDate();
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(new Date(yesterday));
    // this.selectedDate = this.sel_checkindate;
    console.log("this.sels",this.selected_date)
    yesterday.setDate(yesterday.getDate() - 1);
    this.prev_date_value = this.week[yesterday.getDay()] + this.month[yesterday.getMonth()] + yesterday.getDate();
    yesterday.setDate(yesterday.getDate() - 1);
    this.prev_date_value_1 = this.week[yesterday.getDay()] + this.month[yesterday.getMonth()] + yesterday.getDate();
    yesterday.setDate(yesterday.getDate() - 1);
    this.prev_date_value_2 = this.week[yesterday.getDay()] + this.month[yesterday.getMonth()] + yesterday.getDate();
    yesterday.setDate(yesterday.getDate() + 4);
    this.next_date_value = this.week[yesterday.getDay()] + this.month[yesterday.getMonth()] + yesterday.getDate();
    yesterday.setDate(yesterday.getDate() + 1);
    this.next_date_value_1 = this.week[yesterday.getDay()] + this.month[yesterday.getMonth()] + yesterday.getDate();
    yesterday.setDate(yesterday.getDate() + 1);
    this.next_date_value_2 = this.week[yesterday.getDay()] + this.month[yesterday.getMonth()] + yesterday.getDate();
    this.date_change_event.emit(this.selected_date);
  }

  date_value_changed() {
    this.next_date(0);
    // console.log("Date changed:", this.selected_date);
    // this.date_change_event.emit(this.selected_date);
    // // this.selectedDate = this.sel_checkindate;
    // this.date_handling_btn();
  }

  date_handling_btn() {
    let min_date_value = momentTZ.tz(new Date(), this.timezone).toDate();
    const checking_date_value = this.week[min_date_value.getDay()] + this.month[min_date_value.getMonth()] + min_date_value.getDate();
    if (checking_date_value == this.default_value) {
      this.previous_date_handling_btn = false;
    } else {
      this.previous_date_handling_btn = true;
    }
  }

  navigateToDays(days) {
    this.next_date(days);
    this.date_handling_btn()
  }

  chekingDates() {
    if (this.minDate == this.selected_date || this.minDate > this.selected_date) {
      this.previous_date_handling_btn = false;
      if (this.minDate > this.selected_date) {
        var min_date = this.moment(this.minDate, 'YYYY-MM-DD');
        var checkin_date = this.moment(this.selected_date, 'YYYY-MM-DD');
        this.next_date(min_date.diff(checkin_date, 'days'));
      }
    } else {
      this.previous_date_handling_btn = true;
    }
  }
  dateClass(date: Date): MatCalendarCellCssClasses {
    return (this.availableDates.indexOf(this.moment(date).format('YYYY-MM-DD')) !== -1) ? 'example-custom-date-class' : '';
  }
}
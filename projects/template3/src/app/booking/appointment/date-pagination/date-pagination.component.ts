import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeProcessor } from 'jconsumer-shared';
import {
  toZonedTime,
} from 'date-fns-tz';
import {
  format,
  parseISO,
  addDays,
  subDays,
  differenceInDays
} from 'date-fns';

@Component({
  selector: 'app-date-pagination',
  templateUrl: './date-pagination.component.html',
  styleUrls: ['./date-pagination.component.scss']
})
export class DatePaginationComponent implements OnInit {
  @Output() date_change_event = new EventEmitter<any>();
  @Input() selected_date: string;
  @Input() availableDates: string[];

  minDate: string;
  maxDate: Date;
  default_value: string;
  next_date_value: string;
  next_date_value_1: string;
  next_date_value_2: string;
  prev_date_value: string;
  prev_date_value_1: string;
  prev_date_value_2: string;
  previous_date_handling_btn: boolean;
  timezone: string;

  month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  constructor(
    private dateTimeProcessor: DateTimeProcessor,
    public translate: TranslateService
  ) {
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  ngOnInit(): void {
    this.translate.use(JSON.parse(localStorage.getItem('translatevariable') || '"en"'));

    const nowZoned = toZonedTime(new Date(), this.timezone);
    this.minDate = format(nowZoned, 'yyyy-MM-dd');
    this.maxDate = new Date(nowZoned.getFullYear() + 4, 11, 31);

    const selectedZoned = toZonedTime(new Date(this.selected_date), this.timezone);
    this.setDateLabels(selectedZoned);

    if (this.selected_date) {
      this.date_change_event.emit(this.selected_date);
    }

    this.date_handling_btn();
  }

  next_date(n: number): void {
    const baseDate = toZonedTime(new Date(this.selected_date), this.timezone);
    const newDate = addDays(baseDate, n);
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(newDate);
    this.setDateLabels(newDate);
    this.date_change_event.emit(this.selected_date);
    this.date_handling_btn();
  }

  prev_date(n: number): void {
    const baseDate = toZonedTime(new Date(this.selected_date), this.timezone);
    const newDate = subDays(baseDate, n);
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(newDate);
    this.setDateLabels(newDate);
    this.date_change_event.emit(this.selected_date);
    this.date_handling_btn();
  }

  date_value_changed(): void {
    this.next_date(0);
  }

  date_handling_btn(): void {
    const todayZoned = toZonedTime(new Date(), this.timezone);
    const todayLabel = this.week[todayZoned.getDay()] + this.month[todayZoned.getMonth()] + todayZoned.getDate();
    this.previous_date_handling_btn = todayLabel !== this.default_value;
  }

  navigateToDays(days: number): void {
    this.next_date(days);
  }

  chekingDates(): void {
    if (this.minDate >= this.selected_date) {
      this.previous_date_handling_btn = false;
      const min = parseISO(this.minDate);
      const selected = parseISO(this.selected_date);
      const diff = differenceInDays(min, selected);
      if (diff > 0) {
        this.next_date(diff);
      }
    } else {
      this.previous_date_handling_btn = true;
    }
  }

  dateClass(date: Date): MatCalendarCellCssClasses {
    const formatted = format(date, 'yyyy-MM-dd');
    return this.availableDates.includes(formatted) ? 'example-custom-date-class' : '';
  }

  private setDateLabels(baseDate: Date): void {
    this.default_value = this.week[baseDate.getDay()] + this.month[baseDate.getMonth()] + baseDate.getDate();

    const next1 = addDays(baseDate, 1);
    const next2 = addDays(baseDate, 2);
    const next3 = addDays(baseDate, 3);
    const prev1 = subDays(baseDate, 1);
    const prev2 = subDays(baseDate, 2);
    const prev3 = subDays(baseDate, 3);

    this.next_date_value = this.week[next1.getDay()] + this.month[next1.getMonth()] + next1.getDate();
    this.next_date_value_1 = this.week[next2.getDay()] + this.month[next2.getMonth()] + next2.getDate();
    this.next_date_value_2 = this.week[next3.getDay()] + this.month[next3.getMonth()] + next3.getDate();
    this.prev_date_value = this.week[prev1.getDay()] + this.month[prev1.getMonth()] + prev1.getDate();
    this.prev_date_value_1 = this.week[prev2.getDay()] + this.month[prev2.getMonth()] + prev2.getDate();
    this.prev_date_value_2 = this.week[prev3.getDay()] + this.month[prev3.getMonth()] + prev3.getDate();
  }
}

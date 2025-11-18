import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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

type DisplayDate = {
  iso: string;
  dayShort: string;
  dayNumber: number;
  disabled: boolean;
};

@Component({
  selector: 'app-date-pagination',
  templateUrl: './date-pagination.component.html',
  styleUrls: ['./date-pagination.component.css']
})
export class DatePaginationComponent implements OnInit, OnChanges {
  @Output() date_change_event = new EventEmitter<any>();
  @Input() selected_date: string;
  @Input() availableDates: string[];
  @Input() theme: string | null = null;
  @Input() variant: 'default' | 'compact' = 'default';
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
  displayDates: DisplayDate[] = [];
  compactMonthLabel = '';

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

    if (!this.selected_date) {
      this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(nowZoned);
    }

    const selectedZoned = this.getSelectedZonedDate();
    this.setDateLabels(selectedZoned);
    this.updateDisplayDates(selectedZoned);

    if (this.selected_date) {
      this.date_change_event.emit(this.selected_date);
    }

    this.date_handling_btn();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected_date'] && this.selected_date) {
      const selectedZoned = this.getSelectedZonedDate();
      this.setDateLabels(selectedZoned);
      this.updateDisplayDates(selectedZoned);
    }

    if (changes['availableDates'] && this.displayDates.length > 0) {
      this.updateDisplayDates(this.getSelectedZonedDate());
    }

    if (changes['variant'] && this.variant === 'compact') {
      this.updateDisplayDates(this.getSelectedZonedDate());
    }
  }

  next_date(n: number): void {
    const baseDate = this.getSelectedZonedDate();
    const newDate = addDays(baseDate, n);
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(newDate);
    this.setDateLabels(newDate);
    this.updateDisplayDates(newDate);
    this.date_change_event.emit(this.selected_date);
    this.date_handling_btn();
  }

  prev_date(n: number): void {
    const baseDate = this.getSelectedZonedDate();
    const newDate = subDays(baseDate, n);
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(newDate);
    this.setDateLabels(newDate);
    this.updateDisplayDates(newDate);
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
    if (!this.availableDates || this.availableDates.length === 0) {
      return '';
    }
    const formatted = format(date, 'yyyy-MM-dd');
    return this.availableDates.includes(formatted) ? 'example-custom-date-class' : '';
  }

  selectCompactDate(isoDate: string): void {
    if (isoDate === this.selected_date) {
      return;
    }
    const zoned = toZonedTime(new Date(isoDate), this.timezone);
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(zoned);
    this.setDateLabels(zoned);
    this.updateDisplayDates(zoned);
    this.date_change_event.emit(this.selected_date);
    this.date_handling_btn();
  }

  private updateDisplayDates(baseDate: Date): void {
    if (this.variant !== 'compact') {
      this.displayDates = [];
      this.compactMonthLabel = '';
      return;
    }

    this.compactMonthLabel = format(baseDate, 'MMMM yyyy');
    const min = this.minDate ? parseISO(this.minDate) : null;
    if (min) {
      min.setHours(0, 0, 0, 0);
    }

    this.displayDates = [];
    for (let offset = -2; offset <= 2; offset++) {
      const current = addDays(baseDate, offset);
      const iso = format(current, 'yyyy-MM-dd');

      const currentStart = new Date(current);
      currentStart.setHours(0, 0, 0, 0);

      let disabled = false;
      if (min && currentStart < min) {
        disabled = true;
      }

      if (this.availableDates && this.availableDates.length) {
        disabled = disabled || !this.availableDates.includes(iso);
      }

      if (iso === this.selected_date) {
        disabled = false;
      }

      this.displayDates.push({
        iso,
        dayShort: format(current, 'EEE'),
        dayNumber: current.getDate(),
        disabled
      });
    }
  }

  private getSelectedZonedDate(): Date {
    const base = this.selected_date ? new Date(this.selected_date) : new Date();
    return toZonedTime(base, this.timezone);
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

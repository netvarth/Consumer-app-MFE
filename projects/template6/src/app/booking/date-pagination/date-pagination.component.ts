import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { MatCalendarCellCssClasses, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeProcessor } from 'jconsumer-shared';
import { toZonedTime } from 'date-fns-tz';
import {
  addDays,
  differenceInDays,
  endOfMonth,
  format,
  isBefore,
  isAfter,
  isEqual,
  parseISO,
  startOfMonth,
  subDays
} from 'date-fns';

@Component({
  selector: 'app-date-pagination',
  templateUrl: './date-pagination.component.html',
  styleUrls: ['./date-pagination.component.css']
})
export class DatePaginationComponent implements OnInit, OnChanges, AfterViewInit {
  @Output() date_change_event = new EventEmitter<any>();
  @Input() selected_date;
  @Input() availableDates;
  @Input() theme: string | null = null;
  @Input() variant: 'default' | 'compact' = 'default';
  minDate: Date;
  minDateIso: string;
  maxDate: Date;
  default_value: string;
  next_date_value: string;
  next_date_value_1: string;
  next_date_value_2: string;
  month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  prev_date_value: string;
  prev_date_value_1: string;
  prev_date_value_2: string;
  previous_date_handling_btn: boolean;
  timezone: string;
  displayDates: Array<{ iso: string, dayShort: string, dayNumber: string, disabled: boolean }> = [];
  compactMonthLabel = '';
  @ViewChildren('dayButton') dayButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  constructor(
    private dateTimeProcessor: DateTimeProcessor,
    public translate: TranslateService
  ) {
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  ngOnInit(): void {
    this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    const nowZoned = toZonedTime(new Date(), this.timezone);
    this.minDate = nowZoned;
    this.minDateIso = format(nowZoned, 'yyyy-MM-dd');
    this.maxDate = new Date((nowZoned.getFullYear() + 4), 11, 31);
    this.previous_date_handling_btn = false;

    if (!this.selected_date) {
      this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(nowZoned);
    }

    const today_date1 = this.getSelectedZonedDate();

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

    this.date_handling_btn();
    this.buildDisplayDates();
  }

  ngAfterViewInit(): void {
    if (this.variant === 'compact') {
      this.dayButtons.changes.subscribe(() => this.focusSelectedDay());
      this.focusSelectedDay();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected_date'] && this.selected_date) {
      this.date_value_changed();
    }
    if (changes['availableDates']) {
      this.buildDisplayDates();
    }
    if (changes['variant'] && this.variant === 'compact') {
      this.buildDisplayDates();
    }
  }

  next_date(n) {    
    let tommorow = this.getSelectedZonedDate();
    tommorow.setDate(tommorow.getDate() + n);
    this.default_value = this.week[tommorow.getDay()] + this.month[tommorow.getMonth()] + tommorow.getDate();
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(new Date(tommorow));
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
    this.date_change_event.emit(this.selected_date);
    this.date_handling_btn();
    this.buildDisplayDates();
  }
  prev_date(n) {    
    let yesterday = this.getSelectedZonedDate();
    yesterday.setDate(yesterday.getDate() - n);
    this.default_value = this.week[yesterday.getDay()] + this.month[yesterday.getMonth()] + yesterday.getDate();
    this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(new Date(yesterday));
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
    this.buildDisplayDates();
  }

  date_value_changed(event?: MatDatepickerInputEvent<Date>): void {
    if (event?.value) {
      const zoned = toZonedTime(event.value, this.timezone);
      this.selected_date = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(zoned);
    }
    this.next_date(0);
    this.buildDisplayDates();
  }

  date_handling_btn(): void {
    let min_date_value = toZonedTime(new Date(), this.timezone);
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
    if (this.minDateIso == this.selected_date || this.minDateIso > this.selected_date) {
      this.previous_date_handling_btn = false;
      if (this.minDateIso > this.selected_date) {
        const min_date = parseISO(this.minDateIso);
        const checkin_date = parseISO(this.selected_date);
        const diff = differenceInDays(min_date, checkin_date);
        this.next_date(diff);
      }
    } else {
      this.previous_date_handling_btn = true;
    }
  }

  dateClass(date: Date): MatCalendarCellCssClasses {
    const formatted = format(date, 'yyyy-MM-dd');
    return (this.availableDates && this.availableDates.indexOf(formatted) !== -1) ? 'example-custom-date-class' : '';
  }

  selectCompactDate(iso: string) {
    if (iso === this.selected_date) {
      return;
    }
    const current = parseISO(this.selected_date);
    const target = parseISO(iso);
    const diff = differenceInDays(target, current);
    this.next_date(diff);
  }

  trackByIso(_index: number, day: { iso: string }) {
    return day.iso;
  }

  private buildDisplayDates() {
    if (this.variant !== 'compact') {
      this.displayDates = [];
      return;
    }
    const base = parseISO(this.selected_date);
    this.compactMonthLabel = format(base, 'MMMM yyyy');
    const today = parseISO(this.minDateIso);
    const start = startOfMonth(base);
    const end = endOfMonth(base);

    const dates: Array<{ iso: string, dayShort: string, dayNumber: string, disabled: boolean }> = [];

    for (let date = start; !isAfter(date, end); date = addDays(date, 1)) {
      const iso = format(date, 'yyyy-MM-dd');
      const isBeforeMin = isBefore(date, today) && !isEqual(date, today);
      let disabled = isBeforeMin;
      if (this.availableDates && this.availableDates.length) {
        disabled = disabled || this.availableDates.indexOf(iso) === -1;
      }
      if (iso === this.selected_date) {
        disabled = false;
      }
      dates.push({
        iso,
        dayShort: format(date, 'EEE'),
        dayNumber: format(date, 'dd'),
        disabled
      });
    }

    this.displayDates = dates;
    this.focusSelectedDay();
  }

  private focusSelectedDay() {
    if (this.variant !== 'compact') {
      return;
    }
    setTimeout(() => {
      const target = this.dayButtons?.toArray().find(btn =>
        btn.nativeElement.getAttribute('data-iso') === this.selected_date);
      target?.nativeElement.focus();
    });
  }

  private getSelectedZonedDate(): Date {
    const base = this.selected_date ? parseISO(this.selected_date) : new Date();
    return toZonedTime(base, this.timezone);
  }
}

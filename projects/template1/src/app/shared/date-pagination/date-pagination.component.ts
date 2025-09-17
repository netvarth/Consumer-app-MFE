import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatCalendar, MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { DateTimeProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-date-pagination',
  templateUrl: './date-pagination.component.html',
  styleUrls: ['./date-pagination.component.scss']
})
export class DatePaginationComponent implements OnInit, OnChanges {
  @Output() date_change_event = new EventEmitter<any>();
  @Output() month_change_event = new EventEmitter<any>();
  @ViewChild('bookingCalendar') bookingCalendar: MatCalendar<Date>;
  @ViewChild('calendarContainer', { read: ElementRef }) calendarContainer: ElementRef;
  @Input() selected_date;
  @Input() availableDates;
  @Input() width;
  @Input() paymentRequestId;
  minDate: any;
  maxDate: any;
  default_value: String;
  month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  previous_date_handling_btn: boolean;
  moment: any;
  smallDevice: boolean = false;
  constructor(
    private dateTimeProcessor: DateTimeProcessor,
    private cdr: ChangeDetectorRef
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
  }

  ngOnInit(): void {
    if (this.paymentRequestId) {
      this.minDate = new Date(this.selected_date);
    } else {
      this.minDate = new Date();
    }
    this.maxDate = new Date((this.minDate.getFullYear() + 4), 12, 31);
    this.minDate = this.moment(this.minDate).format("YYYY-MM-DD");
    this.date_change_event.emit(this.selected_date);

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['availableDates']) {
      this.cdr.detectChanges(); // Ensure view updates after dates are updated
    }
    if (this.bookingCalendar) {
      this.bookingCalendar.updateTodaysDate(); // Refreshes the calendar
    }
  }
  date_value_changed(event?) {
    this.date_change_event.emit(this.selected_date);
  }
  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      const formattedDate = this.moment(date).format('YYYY-MM-DD');
      const isAvailable = this.availableDates.indexOf(formattedDate) !== -1;
      const cla = isAvailable ? 'example-custom-date-class' : '';
      return cla ? { [cla]: true } : {};
    };
  }
  ngAfterViewInit() {
    this.initCalendarArrows();
  }
  initCalendarArrows() {
    if (this.calendarContainer && this.bookingCalendar) {
      setTimeout(() => { // Timeout to ensure the calendar's activeDate is updated
        const previousButton = this.calendarContainer.nativeElement.querySelector('.mat-calendar-previous-button');
        const nextButton = this.calendarContainer.nativeElement.querySelector('.mat-calendar-next-button');
        if (previousButton && nextButton) {
          previousButton.addEventListener('click', (event) => this.handleArrowClick(event, 'previous'));
          nextButton.addEventListener('click', (event) => this.handleArrowClick(event, 'next'));
        } else {
          console.error('Previous or Next button not found');
        }
      }, 100);
    } else {
      setTimeout(() => this.initCalendarArrows(), 100);
    }
  }
  handleArrowClick(event: MouseEvent, direction: 'previous' | 'next') {
    setTimeout(() => { // Timeout to ensure the calendar's activeDate is updated
      if (this.bookingCalendar) {
        const activeDate = this.moment(this.bookingCalendar?.activeDate);
        let month = activeDate.month();
        let year = activeDate.year();
        let data = {
          month: month + 1,
          year: year
        }
        this.month_change_event.emit(data);
      } else {
        console.error('bookingCalendar is undefined');
      }
    }, 100);
  }
}
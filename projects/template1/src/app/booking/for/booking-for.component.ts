import { Component, Input, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-booking-for',
  templateUrl: './booking-for.component.html',
  styleUrls: ['./booking-for.component.css']
})
export class BookingForComponent implements OnInit {
  @Input() bookingType;
  @Input() commObj;
  @Input() apptDetails_firstName;
  @Input() apptDetails_lastName;
  @Output() editEvent = new EventEmitter<string>();
  
 
  constructor(
    public translate: TranslateService
    ) { }

  ngOnInit(): void {
  }
  getUserFirstLetter() {
    if (this.apptDetails_firstName) {
      const name = this.apptDetails_firstName.split(' ');
      return name[0].charAt(0);
    }
  }
  edit(value: string) {
    this.editEvent.emit(value);
  }

}

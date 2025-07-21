import { Component, Input, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { WordProcessor } from 'jaldee-framework/word-processor';
import { AccountService } from '../../services/account-service';

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
  @Input() apptDetails_title;
  @Output() editEvent = new EventEmitter<string>();
  customer_label: any;
  
 
  constructor(
    public translate: TranslateService,
    private accountService: AccountService,
    private wordProcessor: WordProcessor
    ) {
      this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
      this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
     }

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

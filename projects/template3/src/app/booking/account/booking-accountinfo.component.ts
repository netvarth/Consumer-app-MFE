import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-booking-accountinfo',
  templateUrl: './booking-accountinfo.component.html',
  styleUrls: ['./booking-accountinfo.component.css']
})
export class BookingAccountinfoComponent implements OnInit {

  @Input() businessInfo;
  @Input() smallDevice;

  constructor() { }

  ngOnInit(): void {
    console.log(this.businessInfo);
  }

}

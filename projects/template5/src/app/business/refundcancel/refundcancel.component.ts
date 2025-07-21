import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-refundcancel',
  templateUrl: './refundcancel.component.html',
  styleUrls: ['./refundcancel.component.css']
})
export class RefundcancelComponent implements OnInit {
  @Input() detail;

  constructor(
  ) { }

  ngOnInit() {
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-ivr-confirm',
  templateUrl: './ivr-confirm.component.html',
  styleUrls: ['./ivr-confirm.component.css']
})
export class IvrConfirmComponent implements OnInit {

  constructor(
    private router:Router,
    private location: Location
  ) { }

  ngOnInit(): void {
  }
  goBack() {
    this.location.back();
    // this.router.navigate(['home']);
  }
}

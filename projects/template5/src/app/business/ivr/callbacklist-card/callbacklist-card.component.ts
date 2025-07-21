import { Component, Input, OnInit,  } from '@angular/core';
import { projectConstantsLocal } from 'jaldee-framework/constants';

@Component({
  selector: 'app-callbacklist-card',
  templateUrl: './callbacklist-card.component.html',
  styleUrls: ['./callbacklist-card.component.css']
})
export class CallbacklistCardComponent implements OnInit {
@Input() callBack;
  constructor() { }

  newDateFormat = projectConstantsLocal.DISPLAY_DATE_FORMAT_NEW;
  newTimeFromat = projectConstantsLocal.PIPE_DISPLAY_TIME_FORMAT;
  ngOnInit(): void {
    console.log("callBack",this.callBack)
  }

}

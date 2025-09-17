/* tslint:disable:forin */
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-rating-star',
  templateUrl: './ratingstar.component.html',
  styleUrls: ['./ratingstar.component.css']
})
export class RatingStarComponent implements OnInit, OnChanges {

  @Input() cloudindex: string;
  @Input() ratingval: string;
  @Input() includedFrom: string;
  @Output() ratingreturn = new EventEmitter<any>();
  cdnPath: string = '';
  constructor(private sharedService: SharedService) { 
    this.cdnPath = this.sharedService.getCDNPath();
  }
  curratval: any;
  showDecimalVals = false;
  ngOnInit() {
    this.curratval = this.ratingval || '';
    this.curratval = this.curratval.toString();
    if (this.includedFrom === 'refined' || this.includedFrom === 'moreoptions') {
      this.showDecimalVals = true;
    }
  }
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
  }
  handle_ratingclick(val) {
    const retobj = { 'cloudindex': this.cloudindex, 'selectedrating': val };
    this.curratval = val;
    this.curratval = val.toString();
    this.ratingreturn.emit(retobj);
  }
  clearrating() {
    this.curratval = '';
  }
}

import { Component, OnInit, Input, Output, EventEmitter, } from '@angular/core';
import { CommonService, Messages, StorageService, WordProcessor } from 'jconsumer-shared';

@Component({
  selector: 'app-checkin-consumer-add-member',
  templateUrl: './checkin-add-member.component.html',
  styleUrls: ['./checkin-add-member.component.css']
})
export class CheckinAddMemberComponent implements OnInit {
  fill_fol_det_cap = Messages.FILL_FOLL_DETAILS_CAP;
  first_name_cap = Messages.F_NAME_CAP;
  last_name_cap = Messages.L_NAME_CAP;
  firstname = '';
  lastname = '';
  mobile = '';
  gender = '';
  dob = '';
  dobholder = '';
  parent_id;
  tday = new Date();
  customer_label = '';
  jaldeeid = '';
  @Input() calledFrom: any;
  @Output() returnDetails = new EventEmitter<any>();
  @Input() globalsettings: any;
  salutation: any = [];
  title = '';
  constructor(
    private wordProcessor: WordProcessor,
    private commonService: CommonService,
    private storageService: StorageService

  ) {
  }
  ngOnInit() {
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.storageService.getSalutations().then((data: any) => {
      console.log('accountStorageService123', data)
      this.salutation = data;
    });
  }
  isNumeric(evt) {
    return !this.commonService.isNumber(evt);
  }
  valuechange() {
    const retobj = {
      'fname': this.firstname || '',
      'lname': this.lastname || '',
      'title': this.title || '',
      'mobile': this.mobile || '',
      'gender': this.gender || '',
      'dob': this.dobholder || '',
      'jaldeeid': this.jaldeeid || ''
    };
    this.returnDetails.emit(retobj);
  }
}

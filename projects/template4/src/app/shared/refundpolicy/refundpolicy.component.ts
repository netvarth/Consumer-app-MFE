import { Component, OnInit,Input } from '@angular/core';
import { WordProcessor } from 'jconsumer-shared';


@Component({
  selector: 'app-refundpolicy',
  templateUrl: './refundpolicy.component.html',
  styleUrls: ['./refundpolicy.component.css']
})
export class RefundpolicyComponent implements OnInit {

  customer_label ='';
  provider_label = '';
  @Input() isAppointment !: string;
  constructor( private wordProcessor:WordProcessor) {
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
   }

  ngOnInit(): void {
  }

}

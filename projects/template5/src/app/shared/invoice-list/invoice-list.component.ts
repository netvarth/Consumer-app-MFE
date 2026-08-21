import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-invoice-list',
    templateUrl: './invoice-list.component.html',
    styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit, OnDestroy {
    allInvoices: any;
    filteredInvoice: any;
    stst: any = [
        { value: 'NotPaid', displayName: 'Not Paid' },
        { value: 'PartiallyPaid', displayName: 'Partially Paid' },
        { value: 'FullyPaid', displayName: 'Fully Paid' },
        { value: 'Refund', displayName: 'Refund' },
        { value: 'PartiallyRefunded', displayName: 'Partially Refunded' },
        { value: 'FullyRefunded', displayName: 'Fully Refunded' }
      ];
    constructor(
        public dialogRef: MatDialogRef<InvoiceListComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
      
    }
    
    ngOnInit() {
       console.log(this.data)
       this.allInvoices = this.data;
       this.filteredInvoice = this.allInvoices.filter(status => status.billStatus !== 'Draft');
    }
    ngOnDestroy(): void {

    }
    actionClick(data){
        this.dialogRef.close(data);
    }
    onClick() {
        this.dialogRef.close();
      }
      getStatusDisplayName(statusName) {
        let statusObj = this.stst.filter(status => status.value === statusName);
        if (statusObj.length > 0) {
          return statusObj[0].displayName;
        } else {
          return statusName;
        }
      }
     
}

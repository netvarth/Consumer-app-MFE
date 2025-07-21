import { OnInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { projectConstantsLocal } from 'jconsumer-shared';

@Component({
    selector: 'app-coupon-notes',
    templateUrl: './coupon-notes.component.html',
    styleUrls: ['./coupon-notes.component.scss']
})

export class CouponNotesComponent implements OnInit {
    coupon_notes = projectConstantsLocal.COUPON_NOTES;  
    jCouponMsg;
    couponName;
    constructor(@Inject(MAT_DIALOG_DATA) public data: any
    ) { }
    ngOnInit() {
        this.jCouponMsg = this.data.jCoupon.value.systemNote;
        this.couponName = this.data.jCoupon.key;
    }
}

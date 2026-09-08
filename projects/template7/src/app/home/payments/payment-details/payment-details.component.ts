import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ConsumerService, DateFormatPipe, DateTimeProcessor, Messages, SharedService } from 'jconsumer-shared';

@Component({
    selector: 'app-payment-details',
    templateUrl: './payment-details.component.html',
    styleUrls: ['./payment.details.component.scss']
})
export class PaymentDetailsComponent implements OnInit {
    payments: any = [];
    showRefund = false;
    api_loading = false;
    donationDetails: any = [];
    questionnaire_heading = Messages.QUESTIONNAIRE_CONSUMER_HEADING;
    waitlist: any = [];
    provider_name: any;
    accountProfile: any;
    account: any;
    constructor(
        public locationobj: Location,
        private router: Router,
        private sharedService: SharedService,
        public dateformat: DateFormatPipe,
        private activated_route: ActivatedRoute,
        private consumerService: ConsumerService,
        private dateTimeProcessor: DateTimeProcessor) {
    }
    ngOnInit() {
        this.account = this.sharedService.getAccountInfo();
        this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
        this.activated_route.params.subscribe(
            (qParams) => {
                this.api_loading = true;
                if (qParams['id']) {
                    this.getPayments(qParams['id']);
                }
            });
    }
    gotoPrev() {
        this.locationobj.back();
    }
    getPayments(id) {
        this.consumerService.getConsumerPaymentById(id).subscribe(
            (payments) => {
                this.payments = payments;
                console.log("Payment Details :",this.payments)
                if (this.payments.txnType === 'Donation') {
                    this.getDonations(this.payments.ynwUuid);
                } else if (this.payments.txnType === 'Appointment') {
                    this.getApptDetails(this.payments.ynwUuid, this.payments.accountId);
                } else if (this.payments.txnType === 'Waitlist') {
                    this.getCheckinDetails(this.payments.ynwUuid, this.payments.accountId);
                } else if (this.payments.txnType === 'Order') {
                    this.getOrderDetails(this.payments.ynwUuid, this.payments.accountId);
                } else {
                    this.provider_name =  this.payments?.accountName;
                    this.api_loading = false;
                }
            }
        );
    }
    stringtoDate(dt, mod) {
        let dtsarr;
        if (dt) {
            dtsarr = dt.split(' ');
            const dtarr = dtsarr[0].split('-');
            let retval = '';
            if (mod === 'all') {
                retval = dtarr[2] + '/' + dtarr[1] + '/' + dtarr[0] + ' ' + dtsarr[1] + ' ' + dtsarr[2];
            } else if (mod === 'date') {
                retval = this.dateformat.transformToMonthlyDate(dtarr[0] + '/' + dtarr[1] + '/' + dtarr[2]);
            } else if (mod === 'time') {
                retval = dtsarr[1] + ' ' + dtsarr[2];
                const slots = retval.split('-');
                retval = this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
            }
            return retval;
        } else {
            return '';
        }
    }
    showRefunds() {
        this.showRefund = !this.showRefund;
    }
    providerDetail(event) {
        event.stopPropagation();
        this.router.navigate([this.sharedService.getRouteID()]);
    }
    getDonations(uuid) {
        this.consumerService.getConsumerDonationByUid(uuid).subscribe(
            (donations) => {
                this.donationDetails = donations;
                if (this.donationDetails && this.donationDetails.providerAccount) {
                    this.provider_name = this.donationDetails.providerAccount.businessName;
                }
                this.api_loading = false;
            }
        );
    }
    getApptDetails(uid, accountId) {
        this.consumerService.getAppointmentByConsumerUUID(uid, accountId).subscribe(
            (data) => {
                this.waitlist = data;
                if (this.waitlist.provider) {
                    this.provider_name = this.waitlist.providerAccount.businessName + ',' + ((this.waitlist.provider.businessName) ?
                        this.waitlist.provider.businessName : this.waitlist.provider.firstName + ' ' + this.waitlist.provider.lastName);
                } else {
                    this.provider_name = this.waitlist.providerAccount.businessName
                }
                this.api_loading = false;
            },
        );
    }
    getCheckinDetails(uid, accountId,) {
        this.consumerService.getCheckinByConsumerUUID(uid, accountId).subscribe(
            (data) => {
                this.waitlist = data;
                if (this.waitlist.provider) {
                    this.provider_name = this.waitlist.providerAccount.businessName + ',' + ((this.waitlist.provider.businessName) ?
                        this.waitlist.provider.businessName : this.waitlist.provider.firstName + ' ' + this.waitlist.provider.lastName);
                } else {
                    this.provider_name = this.waitlist.providerAccount.businessName
                }
                this.api_loading = false;
            },
        );
    }
    getOrderDetails(uid, accountId) {
        this.consumerService.getOrderByConsumerUUID(uid, accountId).subscribe(
            (data) => {
                this.waitlist = data;
                if (this.waitlist.provider) {
                    this.provider_name = this.waitlist.providerAccount.businessName + ',' + ((this.waitlist.provider.businessName) ?
                        this.waitlist.provider.businessName : this.waitlist.provider.firstName + ' ' + this.waitlist.provider.lastName);
                } else {
                    this.provider_name = this.waitlist.providerAccount.businessName
                }
                this.api_loading = false;
            },
        );
    }
}

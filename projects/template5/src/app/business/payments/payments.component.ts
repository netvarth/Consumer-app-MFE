import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { ConsumerService } from '../../services/consumer-service';
import { AccountService } from '../../services/account-service';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { DateFormatPipe } from 'jaldee-framework/pipes/date-format';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { SnackbarService } from 'jaldee-framework/snackbar';


@Component({
    selector: 'app-consumer-payments',
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.scss']
})
export class ConsumerPaymentsComponent implements OnInit, OnDestroy {

    payments: any;
    date_cap = Messages.DATE_CAP;
    time_cap = Messages.TIME_CAP;
    refundable_cap = Messages.REFUNDABLE_CAP;
    amount_cap = Messages.AMOUNT_CAP;
    status_cap = Messages.PAY_STATUS;
    mode_cap = Messages.MODE_CAP;
    refunds_cap = Messages.REFUNDS_CAP;
    newDateFormat = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
    subsription: Subscription
    accountId: any;
    private subs = new SubSink();
    loading = false;
    customId: any;
    account: any;
    accountConfig: any;
    theme: any;
    accountProfile: any;
    type: any;
    action = '';
    selectedDoc: any;
    @ViewChild('myDiv') myDiv: ElementRef;
    dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
    fileUrl;
    consumer_label: any;
    provider_label: any;
    documentList: any;
    smallDevice: boolean=false;
    constructor(
        private router: Router,
        public dateformat: DateFormatPipe,
        private dateTimeProcessor: DateTimeProcessor,
        private consumerService: ConsumerService,
        private accountService: AccountService,
        private groupStorageService: GroupStorageService,
        private lStorageService: LocalStorageService,
        private snackbarService:SnackbarService,
        private activated_route: ActivatedRoute,
        public translate: TranslateService) {
            this.subs.sink = this.activated_route.queryParams.subscribe(qparams => {
                console.log('qparams',qparams);
                if(qparams && qparams['type']){
                    this.type= qparams['type'];
                }
              });
    }
    ngOnInit() {
        this.onResizeDevice()
        this.account = this.accountService.getAccountInfo();
        this.accountConfig = this.accountService.getAccountConfig();
        if (this.accountConfig && this.accountConfig['theme']) {
            this.theme = this.accountConfig['theme'];
        }

        this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
        this.accountId = this.accountProfile.id;
        this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
       
        let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
        this.translate.setDefaultLang(language);
        this.translate.use(language);
        //  this.translate.use(JSON.parse(localStorage.getItem('translatevariable')))
        if(this.type && this.type==='payments'){
            this.getPayments();
        }
        else if(this.type && this.type==='Prescriptions'){
            this.getDocument();
        }
    }
    onResizeDevice() {
        if (window.innerWidth <= 767) {
            this.smallDevice = true;
        } else {
            this.smallDevice = false;
        }
    }
    ngOnDestroy(): void {
        this.subsription.unsubscribe();
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
            return;
        }
    }
    getPayments() {
        this.loading = true;
        let params = {};
        if (this.accountId) {
            params['account-eq'] = this.accountId;
        }
        this.subsription = this.consumerService.getConsumerPayments(params).subscribe(
            (paymentsInfo: any) => {
                if (this.accountId) {
                    this.payments = paymentsInfo.filter(payment => payment.accountId == this.accountId);
                } else {
                    this.payments = paymentsInfo;
                }
                this.loading = false;
            }, error => {
                this.loading = false;
            }
        );
    }
    download(url, filename?) {
        const downloadURI = (uri, name) => {
            const link = document.createElement("a");
            link.download = name;
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        downloadURI(url, filename)
    }
    gotoPayment(payment) {
        console.log("payment", payment)
        if (payment.txnType =='SalesOrderInvoice') {
            let navigationExtras: NavigationExtras = {
                queryParams: { 'accId': this.accountId, 'uuid': payment.ynwUuid, 'ynwUuid': true }
            };

            this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
        } else {
            let queryParam = {
                id: payment.id
            };
            const navigationExtras: NavigationExtras = {
                queryParams: queryParam
            };
            this.router.navigate([this.customId, 'payments', payment.id], navigationExtras);
        }   
    }
    gotoInvoice(event,invId) {
        event.stopPropagation();
        let navigationExtras: NavigationExtras = {
            queryParams: { 'accId': this.accountId,  'uuid': invId, 'ynwUuid': true}
          };
       
        this.router.navigate([this.customId, 'order', 'order-bill'],navigationExtras);
    }
    providerDetail(event) {
        this.router.navigate[this.customId]
    }
    backToDashboard() {
        this.router.navigate([this.customId, 'dashboard']);
    }
    getDocument(){
        const _this=this;
        this.loading=true;
        return new Promise((resolve,reject)=>{
            const activeUser = this.groupStorageService.getitemFromGroupStorage('ynw-user');
              console.log(activeUser);
              let providerConsumerId=activeUser.providerConsumer;
            _this.subsription = _this.consumerService.getDocument().subscribe((res:any)=>{
                if(res){
                    resolve(res);
                    console.log('document List',res);
                    this.documentList = res.filter(document => document.prescriptionAttachments && document.prescriptionAttachments.length > 0);
                    this.documentList.reverse();
                    this.loading=false;
                }
            },((error)=>{
                reject(error);
                this.loading=false;
                this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
            }))
        })
        
    }
    actionPerformed(action,doc,event){
        console.log(event);
        console.log('action',action);
        console.log('doc',doc)
        this.action=action;
        if(doc && doc['notes']){
            this.selectedDoc=doc.notes;
        }
        else{
            this.selectedDoc=doc;
        }
        console.log('selectedDoc',this.selectedDoc);
        // event.stopPropagation();
        if(doc && doc['s3path'] && action==='Download'){
            this.download(doc['s3path']);
        }
      
    }
   
    downloadtemp(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    getImageType(prescription) {
        // console.log(prescription.fileType);
        // if (prescription.fileType == 'jpeg' || prescription.fileType == 'png' || prescription.fileType == 'jpg') {
        //   return prescription.thumbnail;
        // } else {
        //   return this.fileService.getImageByType(prescription);
        // }
        if(prescription && prescription['url']){
            this.getFileType(prescription['url']);
        }
        // return this.fileService.getImageByType(prescription);
    }
    getFileType(type) {
        console.log("type1",type);
        if (type) {
          if (type === '.png' || type === 'png') {
            return './assets/images/ImgeFileIcon/png.png'
          }
          else if ( type === 'pdf' || type === '.pdf') {
            return './assets/images/ImgeFileIcon/pdf.png'
          }
          else if ( type === 'bmp' || type === '.bmp') {
            return './assets/images/ImgeFileIcon/bmp.png'
          }
          else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return './assets/images/ImgeFileIcon/docsWord.png'
          }
          else if (type === 'video/mp4') {
            return './assets/images/ImgeFileIcon/video.png'
          }
          else if ( type === '.jpg' || type === 'jpg') {
            return './assets/images/ImgeFileIcon/jpg.png'
          }
          else if (type === 'jpeg' || type === '.jpeg') {
            return './assets/images/ImgeFileIcon/jpeg.png'
          }
          else {
            return './assets/images/ImgeFileIcon/othersFile.png'
          }
        }
    }
}

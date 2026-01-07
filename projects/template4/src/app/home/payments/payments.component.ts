import { Component, OnInit, OnDestroy, ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConsumerService, DateFormatPipe, ErrorMessagingService, GroupStorageService, Messages, projectConstantsLocal, SharedService, ToastService, WordProcessor } from 'jconsumer-shared';
@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit, OnDestroy {

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
    loading = false;
    account: any;
    accountConfig: any;
    theme: any;
    accountProfile: any;
    smallDevice: boolean=false;
    type: string;
    documentList: any;
    modalOpen: boolean=false;
    actionList:any=[
        {
            id:1,
            tooltip:'View',
            tooltipPos:'left',
            iconClass:'fa fa-eye'
        },
        {
            id:2,
            tooltip:'Print',
            tooltipPos:'above',
            iconClass:'fa fa-print'
        },
        {
            id:3,
            tooltip:'Download',
            tooltipPos:'below',
            iconClass:'fa fa-download'
        },
        {
            id:4,
            tooltip:'Note',
            tooltipPos:'right',
            iconClass:'fa fa-sticky-note-o'
        }
    ]
    @ViewChild('modal') modal; // referring modal object
    @ViewChild('closebutton') closebutton;
    action = '';
    selectedDoc: any;
    @ViewChild('myDiv') myDiv: ElementRef;
    dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
    fileUrl;
    consumer_label: any;
    provider_label: any;
    private subs: Subscription = new Subscription();
    cdnPath: string = '';
    constructor(
        private router: Router,
        public dateformat: DateFormatPipe,
        private consumerService: ConsumerService,
        private sharedService: SharedService,
        public translate: TranslateService,
    private activated_route: ActivatedRoute,
    private toastService:ToastService,
    private groupStorageService: GroupStorageService,
    private wordProcessor: WordProcessor,
    private errorService: ErrorMessagingService
    ) {
            this.cdnPath = this.sharedService.getCDNPath();
            const subs = this.activated_route.queryParams.subscribe(qparams => {
                console.log('qparams',qparams);
                if(qparams && qparams['type']){
                    this.type= qparams['type'];
                }
              });
              this.subs.add(subs);
    }
    ngOnInit() {
        this.onResizeDevice()
        this.account = this.sharedService.getAccountInfo();
        this.accountConfig = this.sharedService.getAccountConfig();
        if (this.accountConfig && this.accountConfig['theme']) {
            this.theme = this.accountConfig['theme'];
        }
        this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
        console.log('account',this.account);
        console.log('accountprofile',this.accountProfile);

        this.accountId = this.accountProfile.id;
        // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')))
        this.wordProcessor.setTerminologies(this.sharedService.getTerminologies());
        this.consumer_label = this.wordProcessor.getTerminologyTerm('customer');
        this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
        console.log('consumer_label',this.consumer_label);
        console.log('type',this.type)
        if(this.type && this.type==='payments'){
            this.getPayments();
        }
        else if(this.isDocumentsView()){
            this.getDocument();
        }
        console.log('this.accountId',this.accountId);
    }
    ngOnDestroy(): void {
        if (this.subsription) {
            this.subsription.unsubscribe();
        }        
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
                // retval = this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
            }
            return retval;
        }
        return '';
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
                    console.log('payments', this.payments)
                } else {
                    this.payments = paymentsInfo;
                    console.log('else this.payments', this.payments)
                }
                this.loading = false;
            }, error => {
                this.loading = false;
            }
        );
    }
    gotoPayment(id) {
        event.stopPropagation();
        this.router.navigate([this.sharedService.getRouteID(), 'payments', id]);
    }
    gotoInvoice(event, payment) {
        event?.stopPropagation();
        const bookingId = payment?.ynwUuid || payment?.bookingUid || payment?.uid;
        const invoiceId = payment?.invoiceUid || payment;
        const qParams: any = { paidInfo: false };
        if (invoiceId) {
            qParams['invoiceId'] = invoiceId;
        }
        if (bookingId) {
            this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingId], { queryParams: qParams });
        } else {
            const navigationExtras: NavigationExtras = {
                queryParams: { 'accId': this.accountId, 'uuid': invoiceId, 'ynwUuid': true }
            };
            this.router.navigate([this.sharedService.getRouteID(), 'payments', 'view'], navigationExtras);
        }
    }
    providerDetail(event) {
        this.router.navigate[this.sharedService.getRouteID()]
    }
    backToDashboard() {
        this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
    }
    onResizeDevice() {
        if (window.innerWidth <= 767) {
            this.smallDevice = true;
        } else {
            this.smallDevice = false;
        }
    }
    isDocumentsView(): boolean {
        return this.type === 'documents' || this.type === 'Prescriptions';
    }
    getDocument(){
        const _this=this;
        this.loading=true;
        return new Promise((resolve,reject)=>{
            const activeUser = this.groupStorageService.getitemFromGroupStorage('jld_scon');
              console.log(activeUser);
              let providerConsumerId=activeUser.providerConsumer;
            _this.subsription = _this.consumerService.getDocument().subscribe((res:any)=>{
                if(res){
                    resolve(res);
                    console.log('document List',res);
                    const normalizedList = (Array.isArray(res) ? res : []).map((document) => {
                        // Normalize attachments field to the key used in the template
                        document.prescriptionAttachments = document.prescriptionAttachments || document.attachments || document.documents || [];
                        return document;
                    });
                    this.documentList = normalizedList.filter(document => document.prescriptionAttachments && document.prescriptionAttachments.length > 0);
                    this.documentList.reverse();
                    this.loading=false;
                }
            },((error)=>{
                reject(error);
                this.loading=false;
                let errorObj = this.errorService.getApiError(error);
                this.toastService.showError(errorObj);
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
        if(action === 'Download'){
            event?.stopPropagation();
            const downloadUrl = doc?.s3path || doc?.url;
            const fileName = doc?.fileName || doc?.name;
            if (downloadUrl) {
                this.download(downloadUrl, fileName);
            } else {
                this.toastService.showError('File not available');
            }
        }
    }
    // private isMobileWebView(): boolean {
    //     const userAgent = navigator.userAgent || '';
    //     const isIosWebView = /\b(iPhone|iPad|iPod)\b/.test(userAgent) && !/Safari/i.test(userAgent);
    //     const hasCordova = !!(window as any).cordova;
    //     const hasCapacitor = !!(window as any).Capacitor;
    //     return this.smallDevice || isIosWebView || hasCordova || hasCapacitor;
    // }
    // download(url, filename?) {
    //     if (!url) { return; }
    //     const name = filename || url.split('/').pop() || 'document';
    //     // Try fetching to handle download headers/CORS, fall back to opening the URL
    //     fetch(url).then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         return response.blob();
    //     }).then(blob => {
    //         const blobUrl = window.URL.createObjectURL(blob);
    //         const link = document.createElement('a');
    //         link.href = blobUrl;
    //         link.download = name;
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //         window.URL.revokeObjectURL(blobUrl);
    //     }).catch(() => {
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.target = '_blank';
    //         link.rel = 'noopener';
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //     });
    // }
    download(url, filename?) {
        if (!url) { return; }
        const name = filename || url.split('/').pop() || 'document';

        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error('Network response was not ok');
                return r.blob();
            })
            .then(blob => {
                const w: any = window as any;

                // ✅ Android WebView path: convert to dataURL and pass to native
                if (w.AndroidBridge?.onBlobToDataUrl) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const dataUrl = reader.result as string; // data:<mime>;base64,...
                        w.AndroidBridge.onBlobToDataUrl(
                            dataUrl,
                            blob.type || 'application/octet-stream',
                            name
                        );
                    };
                    reader.onerror = () => w.AndroidBridge?.onBlobError?.('FileReader error');
                    reader.readAsDataURL(blob);
                    return;
                }

                // ✅ Normal browser path
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(() => {
                // fallback
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
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
        if(prescription && prescription['url']){
            this.getFileType(prescription['url']);
        }
    }
    getFileType(type) {
        if (type) {
          if (type === '.png' || type === 'png') {
            return (this.cdnPath + "assets/images/ImgeFileIcon/png.png");
          }
          else if ( type === 'pdf' || type === '.pdf') {
            return (this.cdnPath + "assets/images/ImgeFileIcon/pdf.png");
          }
          else if ( type === 'bmp' || type === '.bmp') {
            return (this.cdnPath + "assets/images/ImgeFileIcon/bmp.png");
          }
          else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return (this.cdnPath + "assets/images/ImgeFileIcon/docsWord.png");
          }
          else if (type === 'video/mp4') {
            return (this.cdnPath + "assets/images/ImgeFileIcon/video.png");
          }
          else if ( type === '.jpg' || type === 'jpg') {
            return (this.cdnPath + "assets/images/ImgeFileIcon/jpg.png");
          }
          else if (type === 'jpeg' || type === '.jpeg') {
            return (this.cdnPath + "assets/images/ImgeFileIcon/jpeg.png");
          }
        }
        return (this.cdnPath + "assets/images/ImgeFileIcon/othersFile.png");
    }
      
}

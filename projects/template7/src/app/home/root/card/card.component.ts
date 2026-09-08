import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe, DateTimeProcessor, LocalStorageService, Messages, projectConstantsLocal, SharedService, WordProcessor } from 'jconsumer-shared';
@Component({
    'selector': 'app-card',
    'templateUrl': './card.component.html',
    'styleUrls': ['./card.component.css']
})
export class CardComponent implements OnInit, OnChanges, AfterViewChecked {
    @Input() item: any;
    @Input() terminology: any;
    @Input() loc: any;
    @Input() extras: any;
    @Input() domain: any;
    @Input() config: any;
    @Output() actionPerformed = new EventEmitter<any>();
    @Output() noteClicked = new EventEmitter<any>();
    @Input() type: any;
    @Input() time_type: any;
    @Input() allLabels: any;
    @Input() theme: any;
    @Input() teams: any;
    @Input() source: any;
    @Input() cardType: any;
    // @Input() pos;
    @Input() statusAction: any;
    service: any;
    user: any;
    department: any;
    timingCaption: string = '';
    timings: string = '';
    server_date;
    buttonCaption = Messages.GET_TOKEN;
    personsAheadText = '';
    personsAheadCaption = '';
    itemQty = 0;
    actions: string = '';
    todayDate: any;
    waitlist: any;
    appointment: any;
    newTimeDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
    customer_label = '';
    selectedUser: any;
    selQIds: any = [];
    qualificatio: any;
    disablecheckavailabilitybutton = false;
    tooltipcls = '';
    cdnPath: string = '';
    constructor(
        private lStorageService: LocalStorageService,
        private wordProcessor: WordProcessor,
        private datePipe: DateFormatPipe,
        private dateTimeProcessor: DateTimeProcessor,
        private sharedService: SharedService,
        public translate: TranslateService,
        private cdref: ChangeDetectorRef) {
        this.server_date = this.lStorageService.getitemfromLocalStorage('sysdate');
    }

    ngOnInit(): void {
        this.cdnPath = this.sharedService.getCDNPath();
        this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
        console.log("department",this.item);
        if (this.type) {
            this.item.type = this.type;
        }
        this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
        this.todayDate = this.datePipe.transformTofilterDate(new Date());
        switch (this.item.type) {
            case 'appointment-dashboard': 
                    this.appointment = this.item;
                    this.appointment['displayTime'] = this.getSingleTime(this.appointment.appmtFor[0].apptTime);
                this.appointment['delay'] = this.getTimeMinute(this.appointment.apptDelay);
                    break;
            case 'waitlist':
                this.service = this.item.item;
                console.log("Waitlist Service: ", this.service);
                if (this.service.serviceAvailability['personAhead'] >= 0) {
                    this.personsAheadCaption = "People in line";
                    this.personsAheadText = this.service.serviceAvailability['personAhead'];
                }
                if (this.service.serviceAvailability['showToken']) {
                } else {
                    this.buttonCaption = 'Get ' + this.getTerminologyTerm('waitlist');
                }
                if (this.service.serviceAvailability['calculationMode'] !== 'NoCalc') {
                    if (this.service.serviceAvailability['serviceTime']) {
                        this.timingCaption = 'Next Available Time';
                        this.timings = this.getAvailibilityForCheckin(this.service.serviceAvailability['availableDate'], this.service.serviceAvailability['serviceTime']);
                    } else {
                        this.timingCaption = 'Est Wait Time';
                        this.timings = this.getTimeToDisplay(this.service.serviceAvailability['queueWaitingTime']);
                    }
                }
                console.log("Timings:", this.timings);
                console.log("Person ahead:", this.personsAheadText);
                if (this.timings === '' && this.personsAheadText === '') {
                    this.cardType="card_1";
                }
                break;
            case 'appt':
                this.service = this.item.item;
                console.log("Appt Service: ", this.service);
                console.log("Appointment Info :",this.service)
                this.timingCaption = 'Next Available Time';
                this.timings = this.getAvailabilityforAppt(this.service.serviceAvailability.nextAvailableDate, this.service.serviceAvailability.nextAvailable);             
                if(this.service.serviceBookingType === 'request'){
                    this.buttonCaption = 'Request';
                } 
                else{
                    let buttonTitle = this.getTerminologyFromConfig('get_appointment');
                    console.log("Button Caption:", buttonTitle);
                    this.buttonCaption = ((buttonTitle!==null) ? buttonTitle: 'Get Appointment');
                }
                console.log("Timings:", this.timings);
                console.log("Person ahead:", this.personsAheadText);
                if (this.timings !== '' && this.personsAheadText !== '') {
                    this.cardType="card_1";
                }        
                break;
            case 'donation':
                this.service = this.item.item;
                this.buttonCaption = 'Donate';
                break;
            case 'catalog':
                this.service = this.item.item;
                break;
            case 'item':
                this.service = this.item.item;
                break;
            case 'pitem':
                this.service = this.item.item;
                this.actions = this.extras;
                break;
            case 'order-details-item':
                this.service = this.item.item;
                break;
            case 'item-head':
                break;
            case 'checkin-dashboard':
                this.waitlist = this.item;
                break;
            case 'appt-dashboard':
                this.waitlist = this.item;
                break;
            case 'department':
                this.department = this.item.item;
                console.log("This department", this.department);
                break;
            default:
                this.user = this.item.item;
                break;
        }
        console.log('waitlist...', this.waitlist)
    }
    getServiceName(serviceName: string) {
        let name = '';
        if (serviceName.length > 12) {
            name = serviceName.substring(0, 12) + '...';
        } else {
            name = serviceName;
        }
        return name;
    }

    ngOnChanges() {
        // console.log("Config:", this.config);
    }
    ngAfterViewChecked() {
        this.cdref.detectChanges();
    }

    getTimeMinute(time: any) {
        let hr;
        let min;
        if (time >= 60) {
            hr = Math.floor(time / 60);
            min = Math.floor(time % 60);
            return 'delayed by ' + hr + 'hr' + ':' + min + 'mins';
        }
        if (time < 60) {
            min = Math.floor(time % 60);
            return 'delayed by ' + min + 'mins';
        }
        // if (time === 0) {
            return '';
        // }
        

    }
    getItemQty(itemObj: any) {
        const item = itemObj.item;
        const orderList = this.extras;
        let qty = 0;
        if (orderList !== null && orderList.filter((i: { item: { itemId: any; }; }) => i.item.itemId === item.itemId)) {
            qty = orderList.filter((i: { item: { itemId: any; }; }) => i.item.itemId === item.itemId).length;
        }
        return qty;
    }
    stopProp(event: any) {
        event.stopPropagation();
    }
    cardActionPerformed(type: any, action: any, service: any, location: any, userId: any, event: any, item?: any) {
        event.stopPropagation();
        const actionObj: any = {};
        if (item) {
            item['loading'] = true;
            actionObj['item'] = item;
        }
        actionObj['type'] = type;
        actionObj['action'] = action;
        if (service) {
            actionObj['service'] = service;
        }

        if (location) {
            actionObj['location'] = location;
        }
        if (userId) {
            actionObj['userId'] = userId;
        }
        //if (item)
        
        this.actionPerformed.emit(actionObj);
    }
    showConsumerNote(item: any) {
        this.noteClicked.emit(item);
    }
    getTerminologyTerm(term: any) {
        const term_only = term.replace(/[\[\]']/g, ''); // term may me with or without '[' ']'
        console.log(this.terminology);
        if (this.terminology) {
            return this.wordProcessor.firstToUpper((this.terminology[term_only]) ? this.terminology[term_only] : ((term === term_only) ? term_only : term));
        } else {
            return this.wordProcessor.firstToUpper((term === term_only) ? term_only : term);
        }
    }

    getTerminologyFromConfig(term: any) {
        if(this.config && this.config.terminologies && this.config.terminologies[term]) {
            return this.config.terminologies[term];
        }
        return null; 
    }
    
    getTimeToDisplay(min: any) {
        return this.dateTimeProcessor.convertMinutesToHourMinute(min);
    }
    getAvailibilityForCheckin(date: any, serviceTime: any) {
        const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
        const today = new Date(todaydt);
        const dd = today.getDate();
        const mm = today.getMonth() + 1; // January is 0!
        const yyyy = today.getFullYear();
        let cday = '';
        if (dd < 10) {
            cday = '0' + dd;
        } else {
            cday = '' + dd;
        }
        let cmon;
        if (mm < 10) {
            cmon = '0' + mm;
        } else {
            cmon = '' + mm;
        }
        const dtoday = yyyy + '-' + cmon + '-' + cday;
        if (dtoday === date) {
            return ('Today' + ', ' + serviceTime);
        } else {
            return (this.dateTimeProcessor.formatDate(date, { 'rettype': 'monthname' }) + ', '
                + serviceTime);
        }
    }
    getAvailabilityforAppt(date: any, time: any) {
        const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
        const today = new Date(todaydt);
        const dd = today.getDate();
        const mm = today.getMonth() + 1; // January is 0!
        const yyyy = today.getFullYear();
        let cday = '';
        if (dd < 10) {
            cday = '0' + dd;
        } else {
            cday = '' + dd;
        }
        let cmon;
        if (mm < 10) {
            cmon = '0' + mm;
        } else {
            cmon = '' + mm;
        }
        const dtoday = yyyy + '-' + cmon + '-' + cday;
        if (dtoday === date) {
            return ('Today' + ', ' + this.getSingleTime(time));
        } else {
            return (this.dateTimeProcessor.formatDate(date, { 'rettype': 'monthname' }) + ', '
                + this.getSingleTime(time));
        }
    }
    getSingleTime(slot: any) {
        const slots = slot.split('-');
        return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
    getAvailableSlot(slots: any) {
        let slotAvailable = '';
        for (let i = 0; i < slots.length; i++) {
            if (slots[i].active) {
                slotAvailable = this.getSingleTime(slots[i].time);
                break;
            }
        }
        return slotAvailable;
    }
    getPic(user: any) {
        if (user.profilePicture) {
            return user.profilePicture['url'];
        }
        return null;
        // return 'assets/images/img-null.svg';
    }
    getItemImg(item: any) {
        if (item.itemImages) {
            const img = item.itemImages.filter((image: { displayImage: any; }) => image.displayImage);
            if (img[0]) {
                return img[0].url;
            } else {
                return this.cdnPath + 'customapp/assets/images/order/Items.svg';
            }
        } else {
            return this.cdnPath + 'customapp/assets/images/order/Items.svg';
        }
    }
    getServiceType() {
        if (this.service.serviceType && this.service.serviceType == 'physicalService') {
            return 'Physical Service';
        }
        else if (this.service.serviceType && this.service.serviceType == 'virtualService') {
            return 'Virtual Service';
        }
        else {
            return ' ';
        }
    }
    getDisplayname(label: any) {
        for (let i = 0; i < this.allLabels.length; i++) {
            if (this.allLabels[i].label === label) {
                return this.allLabels[i].displayName;
            }
        }
    }
    getLabels(checkin: any) {
        let label: any = [];
        Object.keys(checkin.label).forEach(key => {
            for (let i = 0; i < this.allLabels.length; i++) {
                if (this.allLabels[i].label === key) {
                    label.push(this.allLabels[i].displayName);
                }
            }
        });
        const lbl = label.toString();
        return lbl.replace(/,/g, ", ");
    }
    checkinActions(waitlist: any, type: any) {
        this.actionPerformed.emit({ waitlist: waitlist, type: type, statusAction: this.statusAction });
    }
    getAge(age: any) {
        age = age.split(',');
        return age[0];
    }
    getUsersList(teamid: any) {
        const userObject = this.teams.filter((user: { id: string; }) => parseInt(user.id) === teamid);
        return userObject[0].name;
    }
}

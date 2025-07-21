import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CalendarOptions, GoogleCalendar } from 'datebook';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { projectConstantsLocal } from 'jaldee-framework/constants';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { SubSink } from 'subsink';
import { AccountService } from '../../services/account-service';
import { ConsumerService } from '../../services/consumer-service';

@Component({
  selector: 'app-confirm-page',
  templateUrl: './confirm-page.component.html',
  styleUrls: ['./confirm-page.component.css']
})
export class ConfirmPageComponent implements OnInit, OnDestroy {
  infoParams;
  appointment: any = [];
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  email;
  apiloading = false;
  provider_label;
  type = 'appt';
  private subs = new SubSink();
  theme: any;
  customId;
  from: any;
  selectedApptsTime: any;
  calender = false;
  calendarEvents;
  selectedSlots: any;
  businessName: any;
  events: any[];
  calendarUrl: any;
  account: any;
  accountProfile: any;
  accountConfig: any;
  constructor(
    private route: ActivatedRoute,
     private router: Router,
    private wordProcessor: WordProcessor, 
    private lStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessor,
    private consumerService: ConsumerService,
    private accountService: AccountService,
    public translate: TranslateService
  ) {
  }
  addToCalendar() {
    this.calendarUrl;
    let config: CalendarOptions;

    if (this.selectedApptsTime) {
      if (this.appointment.providerAccount && this.appointment.providerAccount.businessName) {
        this.businessName = this.appointment.providerAccount.businessName;
      }
      const startDate = new Date(this.appointment.appmtDate);
      config = {
        title: this.businessName + ' - ' + this.appointment.service.name,
        location: this.appointment.location?.place,
        description: 'Time Slots: ' + this.selectedApptsTime,
        start: startDate
      }
    } else {
      if (this.type === 'reschedule') {
        if (this.appointment.providerAccount && this.appointment.providerAccount.businessName) {
          this.businessName = this.appointment.providerAccount.businessName;
        }
        let times = this.appointment.appmtTime.split("-");

        const startTime = times[0];
        const endTime = times[1];
        console.log("Appt Date:", this.appointment.appmtDate);
        console.log("End Time:", endTime);

        const startDate = new Date(this.appointment.appmtDate + 'T' + startTime);
        const endDate = new Date(this.appointment.appmtDate + 'T' + endTime);
        config = {
          title:  this.businessName + ' - ' + this.appointment.service.name,
          location: this.appointment.location?.place,
          description: 'Service provider : ' + this.businessName,
          start: startDate,
          end: endDate,
        }
      } else {
        if (this.appointment.providerAccount && this.appointment.providerAccount.businessName) {
          this.businessName = this.appointment.providerAccount.businessName;
        }
        console.log("Appt time:",this.appointment.appmtTime);
        let times = this.appointment.appmtTime.split("-");
        const startTime = times[0];
        const endTime = times[1];
        console.log("Appt Date:", this.appointment.appmtDate);
        console.log("End Time:", endTime);

        const startDate = new Date(this.appointment.appmtDate + 'T' + startTime);
        const endDate = new Date(this.appointment.appmtDate + 'T' + endTime);
        config = {
          title:  this.businessName + ' - ' + this.appointment.service.name,
          location: this.appointment.location?.place,
          description: 'Service provider : ' + this.businessName,
          start: startDate,
          end: endDate
        }
      }
    }
    console.log("config:", config);
    const googleCalendar = new GoogleCalendar(config);
    this.calendarUrl = googleCalendar.render();
  }
  addScript(script) {
    let script_tag = document.createElement("script");
    script_tag.type = "text/javascript";
    script_tag.text = script;
    document.getElementById('scriptContainer').appendChild(script_tag);
  }
  ngOnInit() {
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.accountConfig = this.accountService.getAccountConfig();
    console.log("AccountConfig:", this.accountConfig);
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.subs.sink = this.route.queryParams.subscribe(
      params => {
        this.infoParams = params;
        if (params['selectedApptsTime']) {
          this.selectedApptsTime = params['selectedApptsTime'];
        }
        if (params['selectedSlots']) {
          this.selectedSlots = JSON.parse(params['selectedSlots']);
        }
        if (params['uuid']) {
          this.subs.sink = this.consumerService.getAppointmentByConsumerUUID(params['uuid'], this.accountProfile.id).subscribe(
            (appt: any) => {
              this.appointment = appt;
              this.addToCalendar();
              this.apiloading = false;
              this.lStorageService.removeitemfromLocalStorage('itemArray');  
              this.lStorageService.removeitemfromLocalStorage('quesStore');
              this.lStorageService.removeitemfromLocalStorage('serviceOPtionInfo'); 
              this.lStorageService.removeitemfromLocalStorage('serviceTotalPrice'); 
              if (this.accountConfig && this.accountConfig['scripts'] && this.accountConfig['scripts']['appointment_confirm']) {
                console.log(this.accountConfig['scripts']['appointment_confirm_app']);
                this.addScript(this.accountConfig['scripts']['appointment_confirm_app']);
              }
            });
        }
        if (params['type']) {
          this.type = params['type'];
        }
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  okClick(appt) {
    if (this.calender) {
      if (appt.service.livetrack && this.type !== 'reschedule') {
        this.router.navigate([this.customId, 'appointment', 'track', this.infoParams.uuid]);
      } else {
          this.router.navigate([this.customId,'dashboard']);
      }
      this.lStorageService.setitemonLocalStorage('orderStat', false);
    }
    else {
      if (appt.service.livetrack && this.type !== 'reschedule') {
        this.router.navigate([this.customId, 'appointment', 'track', this.infoParams.uuid]);
      } else {
          this.router.navigate([this.customId,'dashboard']);
      }
      this.lStorageService.setitemonLocalStorage('orderStat', false);
    }
  }
  getSingleTime(slot) {
    if (slot) {
      const slots = slot.split('-');
      return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
  }
  updateEmail() {
  }
}

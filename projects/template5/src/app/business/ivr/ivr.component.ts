import { Component, OnInit } from '@angular/core';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { BookingService } from '../../services/booking-service';
import { Location } from '@angular/common';
import { AccountService } from '../../services/account-service';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { MatDialog } from '@angular/material/dialog';
import { IvrConfirmComponent } from './ivr-confirm/ivr-confirm.component';
import { SnackbarService } from 'jaldee-framework/snackbar';
@Component({
  selector: 'app-ivr',
  templateUrl: './ivr.component.html',
  styleUrls: ['./ivr.component.css']
})
export class IvrComponent implements OnInit {
  selectedLanguage: any;
  laguages: any = [];
  consumerPhone: any;
  consumerId: any;
  consumerType: any;
  ivrDialog: any;
  countryCode: any;
  constructor(
    private groupService: GroupStorageService,
    private accountService: AccountService,
    private bookingService: BookingService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private lStorageService: LocalStorageService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    let ynwUser = this.groupService.getitemFromGroupStorage('ynw-user');
    if (ynwUser) {
      this.consumerId = ynwUser.providerConsumer;
      this.consumerType = ynwUser.userTypeEnum;
      const credentials = this.accountService.getJson(this.lStorageService.getitemfromLocalStorage('ynw-credentials'));
      if (credentials) {
        this.countryCode = credentials.countryCode;
      }
      this.consumerPhone = ynwUser.primaryPhoneNumber;
      this.getIvrLanguages(ynwUser.providerConsumer);
    }
  }
  getIvrLanguages(id) {
    this.bookingService.getIvrLanguageList(id).subscribe((data) => {
      this.laguages = data;
      console.log("languages", this.laguages)
    })
  }
  goBack() {
    this.location.back();
  }
  createCallbackRequest(language) {
    const post_data = {
      'consumerId': this.consumerId,
      'consumerType': this.consumerType,
      'consumerPhone': {
        'countryCode': this.countryCode,
        'number': this.consumerPhone
      },
      'language': language
    };
    this.bookingService.createCallbackRequest(post_data).subscribe((data) => {
      if(data) {
        this.ivrDialog = this.dialog.open(IvrConfirmComponent, {
          width: '50%',
          panelClass: ['commonpopupmainclass', 'popup-class', 'specialclass'],
          disableClose: true,
          data: {
          }
        });
        this.ivrDialog.afterClosed().subscribe(() => {
        });
      }
    }, (error) => {
      this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
    })
  }
}

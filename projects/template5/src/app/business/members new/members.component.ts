import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConsumerService } from '../../services/consumer-service';
import { AddMembersHolderComponent } from '../add-members-holder/add-members-holder.component';
import { AccountService } from '../../services/account-service';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { ConfirmBoxComponent } from 'jaldee-framework/confirm';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { GroupStorageService } from 'jaldee-framework/storage/group';
@Component({
  selector: 'app-consumer-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss','./membersPC.component.scss']
})
export class MembersComponent implements OnInit, OnDestroy {

  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
  dashboard_cap = Messages.DASHBOARD_TITLE;
  add_fam_memb_cap = Messages.ADD_FAMILY_MEMBER;
  first_name_cap = Messages.FIRST_NAME_CAP;
  last_name_cap = Messages.LAST_NAME_CAP;
  mobile_no_cap = Messages.MOBILE_NUMBER_CAP;
  gender_cap = Messages.GENDER_CAP;
  date_of_birth = Messages.DOB_CAP;
  edit_btn_cap = Messages.EDIT_BTN;
  delete_btn_cap = Messages.DELETE_BTN;
  related_links_cap = Messages.RELATED_LINKS;
  user_profile_cap = Messages.USER_PROF_CAP;
  change_mob_no_cap = Messages.CHANGE_MOB_CAP;
  add_change_email_cap = Messages.ADD_CHANGE_EMAIL;
  curtype;
  member_list: any = [];
  query_executed = false;
  emptyMsg = 'No Family members added yet';
  private subs = new SubSink();
  customId: any;
  accountId: any;
  theme: any;
  account: any;
  accountConfig: any;
  accountProfile: any;
  family_members_cap = Messages.FAMILY_MEMBERS;
  smallDevice;  
  customerId: any;
  constructor(private consumerService: ConsumerService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    public translate: TranslateService,
    private location: Location,
    private groupService: GroupStorageService,
    public router: Router,
    private accountService: AccountService
  ) {
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
      if (window.innerWidth <= 767) {
          this.smallDevice = true;
      } else {
          this.smallDevice = false;
      }
  }
  ngOnInit() {
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    let ynwUser = this.groupService.getitemFromGroupStorage('ynw-user');
    if(ynwUser.providerConsumer) {
      this.customerId = ynwUser.providerConsumer; 
    }
    this.getMembers();
    this.onResize()
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  getMembers() {
    this.subs.sink = this.consumerService.getMembers(this.customerId)
      .subscribe(
        data => {
          console.log("member_list",this.member_list)
          this.member_list = data;
          this.query_executed = true;
        },
        () => {
        }
      );
  }
  goBack() {
    this.location.back();
  }
  doRemoveMember(member) {
    if (!member.id) {
      return false;
    }
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'confirmationmainclass', this.theme],
      disableClose: true,
      data: {
        'message': 'Do you really want to delete this Member?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeMember(member.id,member.parent);
      }
    });
  }
  removeMember(memberId,parentID) {
    this.subs.sink = this.consumerService.deleteMember(memberId,parentID)
      .subscribe(
        () => {
          this.getMembers();
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  addMember() {
    const dialogRef = this.dialog.open(AddMembersHolderComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'popup-class', this.theme],
      disableClose: true,
      data: {
        type: 'add',
        moreparams: { source: 'memberadd' }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
        this.getMembers();
      }
    });
  }
  editMember(member) {
    const dialogRef = this.dialog.open(AddMembersHolderComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'popup-class', this.theme],
      disableClose: true,
      data: {
        member: member,
        type: 'edit'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
        this.getMembers();
      }
    });
  }
  redirectto(mod) {
    switch (mod) {
      case 'profile':
        this.router.navigate([this.customId, 'profile']);
        break;
      case 'change-password':
        this.router.navigate([this.customId, 'change-password']);
        break;
      case 'change-mobile':
        this.router.navigate([this.customId, 'change-mobile']);
        break;
      case 'dashboard':
        this.router.navigate([this.customId, 'dashboard']);
        break;
    }
  }
}
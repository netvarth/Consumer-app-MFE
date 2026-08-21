import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  ConfirmBoxComponent,
  ConsumerService,
  ErrorMessagingService,
  GroupStorageService,
  Messages,
  projectConstantsLocal,
  SharedService,
  ToastService
} from 'jconsumer-shared';
import { AddMembersHolderComponent } from '../add-members-holder/add-members-holder.component';

@Component({
  selector: 'app-consumer-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
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
  accountId: any;
  theme: any;
  family_members_cap = Messages.FAMILY_MEMBERS;
  smallDevice;
  customerId: any;
  config: any;
  cdnPath: string = '';
  constructor(
    private consumerService: ConsumerService,
    private dialog: MatDialog,
    private toastService: ToastService,
    public translate: TranslateService,
    private location: Location,
    private groupService: GroupStorageService,
    public router: Router,
    private sharedService: SharedService,
    private errorService: ErrorMessagingService
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
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
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    let ynwUser = this.groupService.getitemFromGroupStorage('jld_scon');
    console.log("ynwUser", ynwUser)
    if (ynwUser.providerConsumer) {
      this.customerId = ynwUser.providerConsumer;
    }
    this.getMembers();
    this.onResize()
  }
  ngOnDestroy(): void {
    // this.subs.unsubscribe();
  }
  getMembers() {
    this.consumerService.getMembers(this.customerId)
      .subscribe(
        data => {
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
        this.removeMember(member.id, member.parent);
      }
    });
    return true;
  }
  removeMember(memberId, parentID) {
    this.consumerService.deleteMember(memberId, parentID)
      .subscribe(
        () => {
          this.getMembers();
        },
        error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
  }
  addMember() {
    const dialogRef = this.dialog.open(AddMembersHolderComponent, {
      width: '70%',
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
    console.log("member", member)
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
        this.router.navigate([this.sharedService.getRouteID(), 'profile']);
        break;
      case 'change-password':
        this.router.navigate([this.sharedService.getRouteID(), 'change-password']);
        break;
      case 'change-mobile':
        this.router.navigate([this.sharedService.getRouteID(), 'change-mobile']);
        break;
      case 'dashboard':
        this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
        break;
    }
  }
}
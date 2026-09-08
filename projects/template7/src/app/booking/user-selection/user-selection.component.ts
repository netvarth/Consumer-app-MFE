import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SharedService, WordProcessor } from 'jconsumer-shared';
import { BookingService } from '../booking.service';


@Component({
  selector: 'app-user-selection',
  templateUrl: './user-selection.component.html',
  styleUrls: ['./user-selection.component.scss']
})
export class UserSelectionComponent implements OnInit {

  @Output() actionPerformed = new EventEmitter<any>();
  // @Output() userSelected = new EventEmitter<any>();
  @Input() config;
  provider_label: any;
  activeUsers;
  selectedDeptId;     // Department Id of the selected service
  selectedUserId: any;
  selectedDepartment;
  otherServices;
  cdnPath: string = '';
  constructor(
    private wordProcessor: WordProcessor,
    private bookingService: BookingService,
    private sharedService: SharedService
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider')
  }

  ngOnInit(): void {
    let department = this.bookingService.getSelectedDepartment();
    if (department) {
      this.selectedDepartment = department;
      this.selectedDeptId = department.departmentId;
      this.activeUsers = this.bookingService.getActiveUsers();
      let deptServices = this.bookingService.getServicesByDepartment(this.selectedDeptId);
      this.otherServices = deptServices.filter(service => !service.provider);
    } else {
      this.activeUsers = this.bookingService.getUsers();
      let services = this.bookingService.getServices();
      this.otherServices = services.filter(service => !service.provider);
    }
    let activeUser = this.bookingService.getSelectedUser();
    if (activeUser) {
      this.selectedUserId = activeUser.id; 
    } else {
      this.bookingService.getGlobalServices(this.selectedDeptId);
    }    
  }
  userClicked(user) {
    if (user) {
      this.selectedUserId = user.id;
      this.bookingService.setActiveService(null);
      this.bookingService.setSelectedUser(user);
      this.bookingService.getServicesByUser(this.selectedUserId);
      // this.userSelected.emit(user);
    } else {
      this.selectedUserId = null;
      this.bookingService.setSelectedUser(null);
      if (this.selectedDeptId) {
        this.bookingService.getServicesByDepartment(this.selectedDeptId);
      } else {
        this.bookingService.getGlobalServices();
      }
    }
    this.actionPerformed.emit({'action':'next'});
  }
  goBack() {
    this.actionPerformed.emit({'action':'back'});
  }
  // goToStep() {
  //   this.actionPerformed.emit({'action':'next'});
  // }
}

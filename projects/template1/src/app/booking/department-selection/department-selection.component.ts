import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-department-selection',
  templateUrl: './department-selection.component.html',
  styleUrls: ['./department-selection.component.scss']
})
export class DepartmentSelectionComponent implements OnInit {
  
  selectedDeptId;           // Department Id of the selected service
  bookingType: any;         // Appointment/Checkin
  departments: any = [];    // departments
  @Output() departmentSelected = new EventEmitter<any>();
  @Output() actionPerformed = new EventEmitter<any>();

  constructor(
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.departments = this.bookingService.getDepartments();
    let activeDepartment = this.bookingService.getSelectedDepartment();
    if(activeDepartment) {
      this.selectedDeptId =activeDepartment.departmentId;
    } else {
      activeDepartment = this.departments[0];
      this.bookingService.setSelectedDepartment(activeDepartment);
      this.selectedDeptId = activeDepartment.departmentId;
    }
    this.departmentSelected.emit(activeDepartment);
  }
  
  deparmentClicked(department) {
    this.selectedDeptId = department.departmentId;
    this.bookingService.setSelectedDepartment(department);
    this.departmentSelected.emit(department);
    this.goToStep();
  }
  goBack() {
    this.actionPerformed.emit({'action':'back'});
  }
  goToStep() {
    this.actionPerformed.emit({'action':'next'});
  }
}

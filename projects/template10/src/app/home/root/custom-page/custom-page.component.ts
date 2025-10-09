import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SubscriptionService } from 'jconsumer-shared';
import { Template6Service } from '../template/template6.service';


@Component({
  selector: 'app-custom-page',
  templateUrl: './custom-page.component.html',
  styleUrls: ['./custom-page.component.css']
})
export class CustomPageComponent implements OnInit, OnChanges {

  @Input() parentIndex;
  @Input() action;
  @Input() checkinServices;
  @Input() apptServices;
  @Input() departments;
  headerCaption = 'Back';
  actionString;
  deptApptServices: any;
  deptCheckinServices: any;
  domain: any;
  activeDepartments: any;
  customAction: any;
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    console.log('Back button pressed');
    this.goBack();
  }
  constructor(
    private subscriptionService: SubscriptionService,
    private templateService: Template6Service
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.domain = this.templateService.getDomain();
    console.log(this.apptServices);
    setTimeout(() => {
      document.querySelector('#pageTop').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    if (this.action.dynamic) {
      let keyNvalue = this.action.dynamic.split("#");
      let key = keyNvalue[0];
      let value;
      if (keyNvalue.length > 1) {
        value = keyNvalue[1];
      }
      this.processKeys(key, value, this.action);
    }
  }

  ngOnInit(): void {
    // console.log(this.action);

  }
  processKeys(key: any, value: any, action?) {
    switch (key) {
      case 'department':
        this.actionString = 'deparment';
        if (value) {
          console.log("Deparment:", this.departments);
          let currentDepartment = this.departments.filter((dept) => dept.item.departmentId == value)[0];
          // => dept.item.departmentId === value);
          console.log(currentDepartment);
          this.headerCaption = currentDepartment.item.departmentName;
          console.log(this.apptServices);
          this.deptApptServices = this.apptServices.filter((services) => services.item.department == value);
          console.log(this.checkinServices);
          this.deptCheckinServices = this.checkinServices.filter((services) => services.item.department == value);
          console.log(this.deptApptServices);
          console.log(this.deptCheckinServices);
        }
        break;
      case 'departments':
        this.actionString = 'deparments';
        console.log(this.departments);
        console.log("Department Ids:", action.ids);
        if (action.ids) {
          const activeDepartments = this.departments.filter(department => 
            action.ids.indexOf(department.item.departmentId) !== -1
            );
            this.activeDepartments = activeDepartments;
          console.log(this.activeDepartments);
        } else {
          this.activeDepartments = this.departments;
        }
        break;
      case 'custom':
        this.actionString = 'custom';
        console.log("actions",action);
        this.customAction = action;
    }
  }

  cardClicked(actionObj) {
    this.subscriptionService.sendMessage({ ttype: 'action', value: actionObj });
  }

  goBack() {
    this.subscriptionService.sendMessage({ ttype: 'back', value: this.parentIndex });
  }

}

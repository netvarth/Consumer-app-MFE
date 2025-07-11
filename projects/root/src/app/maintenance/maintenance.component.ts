import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateTimeProcessor, SharedService } from 'jconsumer-shared';
import { projectConstants } from '../../environment';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html'
})

export class MaintenanceComponent implements OnInit {
  loading = false;
  cdnPath = projectConstants.CDNURL;
  constructor(
    private router: Router,
    private dateTimeProcessor: DateTimeProcessor,
    private sharedService: SharedService
  ) { }
  ngOnInit() {
    console.log('maintainance');
    this.goHome();
  }
  goHome() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 500);
    this.dateTimeProcessor.getSystemDate().subscribe(() => {
      this.router.navigate([this.sharedService.getRouteID()]);
    }, (error) => {
      console.log("Error:", error);
    })
  }
}

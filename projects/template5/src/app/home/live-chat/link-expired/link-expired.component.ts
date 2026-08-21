import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-link-expired',
  standalone: true,
  imports: [],
  templateUrl: './link-expired.component.html',
  styleUrl: './link-expired.component.scss'
})
export class LinkExpiredComponent {

  cdnPath;

  constructor(private sharedService: SharedService, private router: Router) {
    this.cdnPath = this.sharedService.getCDNPath();
  }

  goHome() {
    this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
  }
}

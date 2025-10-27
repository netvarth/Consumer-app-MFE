import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent, RouterModule, RouterOutlet } from '@angular/router';
import { EnvironmentService, LocalStorageService, SharedService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { projectConstants } from '../environment';
import { VersionService } from './version.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, ToastModule, CommonModule],
  providers: [ToastService, MessageService,DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  loading: boolean;
  loadingFile: boolean;
  // title = 'Jaldee Site Root';
  private idleTimeout: any;
  private versionCheckTimeout: any;
  constructor(
    private subscriptionService: SubscriptionService,
    private localStorageService: LocalStorageService,
    private deviceService: DeviceDetectorService,
    private router: Router,
    private sharedService: SharedService,
    private environmentService: EnvironmentService,
    private versionService: VersionService
  ) {
    this.sharedService.setCDNPath(projectConstants.CDNURL);
    this.initializeApp();
    this.environmentService.setEnvironment(projectConstants);
    this.subscribeToIdleEvents();
    this.subscribeToOnlineStatus();
  }
  private subscribeToIdleEvents() {
    window.addEventListener('mousemove', () => this.resetIdleTimer());
    window.addEventListener('keydown', () => this.resetIdleTimer());
  }
  private subscribeToOnlineStatus() {
    window.addEventListener('online', () => this.checkVersionPeriodically()); // Recheck version when coming online
    window.addEventListener('offline', () => console.log('App is offline'));
  }
  private resetIdleTimer() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.idleTimeout = setTimeout(() => {
      console.log('App is idle');
      // You can stop background tasks like version checks here
      clearTimeout(this.versionCheckTimeout); // Stop version checks when idle
    }, 300000); // 5 minutes idle timeout
  }
  private subscribeToLoadingMessages(): void {
    this.subscriptionService.getMessage().subscribe(
      (message) => {
        switch (message.ttype) {
          case 'loading_start':
            this.loading = true;
            break;
          case 'loading_stop':
            this.loading = false;
            break;
          case 'loading_file_start':
            this.loading = true;
            this.loadingFile = true;
            break;
          case 'loading_file_stop':
            this.loading = false;
            this.loadingFile = false;
            break;
        }
      }
    )
  }
  setTZ_DeviceInfo() {
    let deviceInfo = this.deviceService.getDeviceInfo();
    this.localStorageService.setitemonLocalStorage('deviceInfo', deviceInfo);
  }
  // Shows and hides the loading spinner during RouterEvent changes
  private navigationInterceptor(event: RouterEvent, router: Router): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
      setTimeout(() => {
        if (document.getElementById('globalLoading')) {
          document.getElementById('globalLoading').remove();
        }
        this.loading = false;
      }, 1000);
    }
  }
  private async initializeApp(): Promise<void> {
    this.setTZ_DeviceInfo();
    this.subscribeToRouterEvents();
    await this.checkVersionPeriodically();
    this.subscribeToLoadingMessages();
  }
  private subscribeToRouterEvents(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof RouterEvent) {
        this.navigationInterceptor(event, this.router);
      }
    })
  }

  private initApp(pVersion: string, cVersion: string): void {
    if (!pVersion) {
      // First-time load, set the version in local storage without reloading
      console.log('First-time load, setting version without reload');
      this.localStorageService.setitemonLocalStorage('c_sversion', cVersion);
    } else if (pVersion !== cVersion) {
      // Version has changed, perform a hard reload to refresh the app
      console.log('Version change detected, performing hard reload');
      // this.localStorageService.clearLocalstorage();
      this.localStorageService.setitemonLocalStorage('c_sversion', cVersion);
      // Perform a hard reload to refresh the app when the version changes
      window.location.href = window.location.href;
    }
  }
  private async checkVersionPeriodically(): Promise<void> {
    try {
      // Set a timeout for the version service call (e.g., 10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Version check timeout')), 10000) // 10 seconds timeout
      );

      // Attempt to fetch the version, with timeout
      const cVersion = await Promise.race([this.versionService.getUIVersion(), timeoutPromise]);
      const pVersion = this.localStorageService.getitemfromLocalStorage('c_version');
      this.initApp(pVersion, cVersion as string);

      this.versionCheckTimeout = setTimeout(() => this.checkVersionPeriodically(), 5 * 60 * 1000); // 5 minutes

    } catch (error) {
      console.error('Error during version check:', error);
      // Handle the error gracefully (e.g., retry logic, notify user, etc.)
    }
  }

}

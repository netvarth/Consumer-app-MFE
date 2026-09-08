import { Component } from '@angular/core';
import { TemplateHomeState } from '../template-home/template-home-state.service';

@Component({
  selector: 'app-home-entry',
  template: `
    <app-root *ngIf="home.config.status === 'legacy'; else subApp"></app-root>
    <ng-template #subApp><app-template-home [config]="home.config" [revision]="home.revision"></app-template-home></ng-template>
  `
})
export class HomeEntryComponent {
  constructor(public home: TemplateHomeState) {}
}

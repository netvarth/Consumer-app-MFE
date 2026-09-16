import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';
import { HomeCard, TemplateHomeConfig } from './template-home.models';
import { TemplateHomeState } from './template-home-state.service';

@Component({
  selector: 'app-template-home',
  templateUrl: './template-home.component.html',
  styleUrls: ['./template-home.component.scss']
})
export class TemplateHomeComponent implements OnChanges {
  @Input() config!: TemplateHomeConfig;
  @Input() revision = 0;
  accountId: any;
  selectedCatalogs: string[] = [];
  failedImages = new Set<string>();

  constructor(public homeState: TemplateHomeState, private router: Router, private shared: SharedService) {}

  ngOnChanges(): void {
    this.accountId = this.shared.getAccountID();
    this.selectedCatalogs = this.shared.getTemplateJSON()?.extras?.selectedCatalogs || [];
    this.failedImages = new Set<string>();
  }

  onItemSearchSelected(event: any): void {
    const link = this.config.hero?.search?.link;
    if (!link) return;
    const query = typeof event?.query === 'string' ? event.query.trim() : '';
    const encId = event?.value?.encId;
    const target = query ? { ...link, queryParams: { ...link.queryParams, query } }
      : typeof encId === 'string' && encId ? { route: ['item', encId] } : null;
    const tree = this.homeState.tree(target);
    if (tree) void this.router.navigateByUrl(tree);
  }

  imageFailed(key: string): void { this.failedImages.add(key); }
  trackCard(_index: number, card: HomeCard): string { return card.key; }
}

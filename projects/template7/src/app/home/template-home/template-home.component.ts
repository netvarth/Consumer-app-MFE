import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
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
  searchText = '';
  failedImages = new Set<string>();

  constructor(public homeState: TemplateHomeState, private router: Router) {}

  ngOnChanges(): void {
    this.searchText = '';
    this.failedImages = new Set<string>();
  }

  submitSearch(): void {
    const query = this.searchText.trim();
    const link = this.config.hero?.search?.link;
    if (!query || !link) return;
    const tree = this.homeState.tree({ ...link, queryParams: { ...link.queryParams, query } });
    if (tree) void this.router.navigateByUrl(tree);
  }

  imageFailed(key: string): void { this.failedImages.add(key); }
  trackCard(_index: number, card: HomeCard): string { return card.key; }
}

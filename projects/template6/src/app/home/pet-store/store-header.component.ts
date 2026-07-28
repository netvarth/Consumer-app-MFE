import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface StoreHeaderConfig {
  logo?: string;
  logoAlt?: string;
  locationLabel?: string;
  locationValue?: string;
  locationLink?: string;
  cartLink?: string;
  profileLink?: string;
  searchPlaceholder?: string;
  backgroundImage?: string;
}

@Component({
  selector: 'app-store-header',
  templateUrl: './store-header.component.html',
  styleUrls: ['./store-header.component.scss']
})
export class StoreHeaderComponent {
  @Input() config: StoreHeaderConfig = {};
  @Input() searchQuery = '';
  @Input() searchIcon = '';
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<void>();
  @Output() action = new EventEmitter<string>();

  updateSearch(value: string): void {
    this.searchQuery = value;
    this.searchQueryChange.emit(value);
  }
}
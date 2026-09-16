import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { OrderService } from 'jconsumer-shared';
import { AutoComplete } from 'primeng/autocomplete';
import { Subscription } from 'rxjs';



interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.scss']
})
export class ItemSearchComponent implements OnChanges, OnDestroy {
  @Input() catalogEncids;
  @Input() accountID: any;
  @Input() autoFocusOnMobile: boolean = true;
  @Input() placeholder = 'what are you looking for?';
  @Input() ariaLabel = 'Search products';
  @Input() disabled = false;
  @Input() hero = false;
  @Input() resetKey = 0;
  private searchSubscription?: Subscription;
  @Output() selectedItemsEmit = new EventEmitter<any>;
  @ViewChild('autocomplete') autocomplete!: AutoComplete;
  selectedItems: any = [];
  selectedItem: any;
  filteredItems: any;
  constructor(
    private orderService : OrderService
  ) {
  }

  ngOnChanges(): void {
    this.searchSubscription?.unsubscribe();
    this.selectedItem = '';
    this.filteredItems = [];
    this.autocomplete?.hide();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.checkScreenSizeAndFocus();
  }

  private checkScreenSizeAndFocus(): void {
    if (this.autoFocusOnMobile && window.innerWidth <= 870) {
      this.focusAutocompleteInput();
    }
  }

  private focusAutocompleteInput(): void {
    const inputEl: HTMLInputElement = this.autocomplete.el.nativeElement.querySelector('input');
    if (inputEl) {
      inputEl.focus();
    }
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSizeAndFocus();
  }

  onItemSelected(event: any) {
    if (this.disabled) return;
    console.log("event",event)
    this.selectedItem = '';
    event.name ? event.name = this.capitalizeFirstLetter(event.name) : '';
    this.selectedItemsEmit.emit(event);
  }
  onSearchSubmit(): boolean {
    const query = typeof this.selectedItem === 'string' ? this.selectedItem.trim() : '';
    if (this.disabled || !query) return false;
    this.autocomplete?.hide();
    this.selectedItemsEmit.emit({ query });
    return true;
  }
  filterItems(event: AutoCompleteCompleteEvent) {
    this.searchSubscription?.unsubscribe();
    const query = event.query.trim().toLowerCase();
    if (!this.disabled && query && this.accountID) {
      this.searchSubscription = this.orderService.searchSpItem(this.accountID, query, this.catalogEncids)
        .subscribe({
          next: (data: any) => { this.filteredItems = data; },
          error: () => { this.filteredItems = []; }
        });
    } else {
      this.filteredItems = [];
    }
  }

  capitalizeFirstLetter(name: string) {
    if (!name) return name;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

}

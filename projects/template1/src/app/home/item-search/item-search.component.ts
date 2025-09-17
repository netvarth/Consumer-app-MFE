import { Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { OrderService } from 'jconsumer-shared';
import { AutoComplete } from 'primeng/autocomplete';



interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.scss']
})
export class ItemSearchComponent {
  @Input() catalogEncids;
  @Input() accountID: any;
  @Output() selectedItemsEmit = new EventEmitter<any>;
  @ViewChild('autocomplete') autocomplete!: AutoComplete;
  selectedItems: any = [];
  selectedItem: any;
  filteredItems: any;
  constructor(
    private orderService : OrderService
  ) {
  }

  ngAfterViewInit(): void {
    this.checkScreenSizeAndFocus();
  }

  private checkScreenSizeAndFocus(): void {
    if (window.innerWidth <= 870) {
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
    console.log("event",event)
    this.selectedItem = '';
    event.name ? event.name = this.capitalizeFirstLetter(event.name) : '';
    this.selectedItemsEmit.emit(event);
  }
  onSearchSubmit(event: any): boolean {
    console.log("event",event)
    console.log("eventthis.selectedItem",this.selectedItem)
    if(((event.which === 13 || event.keyCode === 13) || (event.which === 1 || event.keyCode === 1)) && this.selectedItem) {
      event.query = this.selectedItem;
      this.selectedItemsEmit.emit(event);
      return true;
    } else {
      return false;
    }
  }
  filterItems(event: AutoCompleteCompleteEvent) {
    let query = event.query.toLowerCase();
    if (event.query && this.accountID) {
      this.orderService.searchSpItem(this.accountID, query,this.catalogEncids)
        .subscribe((data: any) => {
          this.filteredItems = data;
        });
    }
  }

  capitalizeFirstLetter(name: string) {
    if (!name) return name;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

}

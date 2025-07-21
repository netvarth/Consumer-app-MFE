import { AfterViewInit, Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { OrderService } from '../../services/order.service';



interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.scss']
})
export class ItemSearchComponent{
  @Input() catalogEncids;
  @Input() accountId;
  @Input() encId: any;
  @Output() selectedItemsEmit = new EventEmitter<any>;
  @ViewChild('autocomplete') autocomplete:AutoComplete;
  selectedItems: any = [];
  selectedItem: any;
  filteredItems: any;
  constructor(
    private orderService : OrderService
  ) {}

  // ngAfterViewInit(): void {
  //   this.checkScreenSizeAndFocus();
  // }

  // private checkScreenSizeAndFocus(): void {
  //   if (window.innerWidth <= 870) {
  //     this.focusAutocompleteInput();
  //   }
  // }

  // private focusAutocompleteInput(): void {
  //   const inputEl: HTMLInputElement = this.autocomplete.el.nativeElement.querySelector('input');
  //   if (inputEl) {
  //     inputEl.focus();
  //   }
  // }

  @HostListener('window:resize', [])
  onResize(): void {
    // this.checkScreenSizeAndFocus();
  }
  
  onItemSelected(event) {
    console.log("event",event)
    this.selectedItem = '';
    event.name ? event.name = this.capitalizeFirstLetter(event.name) : '';
    this.selectedItemsEmit.emit(event);
  }
  onSearchSubmit(event) {
    console.log("event",event)
    console.log("eventthis.selectedItem",this.selectedItem)
    if(((event.which === 13 || event.keyCode === 13) || (event.which === 1 || event.keyCode === 1)) && this.selectedItem) {
      event.query = this.selectedItem;
      this.selectedItemsEmit.emit(event);
    } else {
      return false;
    }
  }
  filterItems(event: AutoCompleteCompleteEvent) {
    let query = event.query.toLowerCase();
    if (event.query && this.accountId) {
      this.orderService.searchSpItem(this.accountId, query, this.catalogEncids)
        .subscribe((data: any) => {
          this.filteredItems = data;
        });
    }
  }

  capitalizeFirstLetter(string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

}

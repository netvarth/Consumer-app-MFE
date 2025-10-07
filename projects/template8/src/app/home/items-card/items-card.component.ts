import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-items-card',
  templateUrl: './items-card.component.html',
  styleUrls: ['./items-card.component.scss']
})
export class ItemsCardComponent implements OnInit {
  @Input() themes: any;
  @Input() items: any;
  @Output() actionPerformed = new EventEmitter<any>();
  responsiveOptions = {
    items: 5,
    loop: true,
    navSpeed: 10000,
    autoplay: true,
    dots: false,
    responsive: {
      0: {
        items: 2
      },
      768: {
        items: 3
      },
      1000: {
        items: 4
      },
      1200: {
        items: 5
      }
    }
  }
  theme: any;
  cdnPath: string = '';
  constructor(private sharedService: SharedService) {
    this.cdnPath = this.sharedService.getCDNPath();
   }

  ngOnInit(): void {
    this.theme = this.themes
  }

  viewItems(item: any) {
    let input = {action:'viewItem', value: item};
    this.actionPerformed.emit(input);
  }

  // addToCart(item: any, $event: any) {
  //   $event.preventDefault();
  //   $event.stopPropagation();
  //   let input = {action:'addToCart', value: item};
  //   this.actionPerformed.emit(input);
  // }
  
  addToCart(item, $event) {
    $event.preventDefault();
    $event.stopPropagation();
    if (item &&  item.itemNature =="VIRTUAL_ITEM") {
      let input = {action:'viewItem', value: item};
      this.actionPerformed.emit(input);
    }else{
      let input = {action:'addToCart', value: item};
      this.actionPerformed.emit(input);
    }
    
  }

}

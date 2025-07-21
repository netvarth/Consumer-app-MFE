import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { SubscriptionService } from 'jaldee-framework/subscription';
import { AccountService } from '../../services/account-service';
import { DialogService } from 'primeng/dynamicdialog';
import { DeliverySelectionComponent } from '../items/delivery-selection/delivery-selection.component';

@Component({
  selector: 'app-items-card',
  templateUrl: './items-card.component.html',
  styleUrls: ['./items-card.component.scss']
})
export class ItemsCardComponent implements OnInit {
  @Input() themes;
  @Input() items;
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
  itemDeliveryType: any;
    deliverydialogRef: any;
  constructor(
    private router: Router,
    private accountService: AccountService,
    private subscriptionService: SubscriptionService,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.theme = this.themes
  }

  viewItems(item) {
    // const navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     itemEncid: item.encId
    //   }
    // }
    // this.router.navigate([this.accountService.getCustomId(), 'details'], navigationExtras);
    let input = {action:'viewItem', value: item};
    this.actionPerformed.emit(input);
  }

  // addToCart(item, $event) {
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
    } else{
      if(item && (item.homeDelivery && item.storePickup)){
        let dialogWidth = window.innerWidth <= 768 ? '330px' : '500px';
                this.itemDeliveryType = 'HOME_DELIVERY';
                this.deliverydialogRef = this.dialogService.open(DeliverySelectionComponent, {
                  header: 'Select Delivery Type',
                  width: dialogWidth,
                  contentStyle: { "max-height": "500px", "overflow": "auto" },
                  baseZIndex: 10000,
                  styleClass: 'custom-dialogs',
                    data:{
                    theme:this.theme
                     }
                });
                this.deliverydialogRef.onClose.subscribe((result:any) => {
                  if(result){
                this.itemDeliveryType = result;
                let input = {action:'addToCart', value: item, itemDeliveryType: this.itemDeliveryType};
                this.actionPerformed.emit(input);
                  }
                });
       
      } else{
      let input = {action:'addToCart', value: item};
      this.actionPerformed.emit(input);
      }
    } 
  }
}

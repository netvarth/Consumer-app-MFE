import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService, SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-shopping-cart-footer',
  templateUrl: './shopping-cart-footer.component.html',
  styleUrl: './shopping-cart-footer.component.css'
})
export class ShoppingCartFooterComponent {
  @Input() cartCount: any;
  
  constructor(
    private sharedService: SharedService,
    private router: Router,
  ) {
  }

  viewCart() {
    this.router.navigate([this.sharedService.getRouteID(), 'cart'])
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartFooterComponent } from './shopping-cart-footer.component';



@NgModule({
  declarations: [ShoppingCartFooterComponent],
  imports: [
    CommonModule
  ],
  exports: [ShoppingCartFooterComponent]
})
export class ShoppingCartFooterModule { }

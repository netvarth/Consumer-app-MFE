import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ItemSearchModule } from '../item-search/item-search.module';
import { MatButtonModule } from '@angular/material/button';
import { I8nModule } from 'jconsumer-shared';
  


@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    InputTextModule,
    I8nModule,
    ItemSearchModule
  ],
  exports:[HeaderComponent]
})
export class HeaderModule { }

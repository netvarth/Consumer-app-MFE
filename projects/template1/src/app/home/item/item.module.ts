import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ItemComponent } from './item.component';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { ItemsCardModule } from '../items-card/items-card.module';
import { ErrrorMessageModule, SkeletonLoadingModule } from 'jconsumer-shared';
import { FormsModule } from '@angular/forms';
import { FillQnrModule } from '../fill-qnr/fill-qnr.module';
import { ButtonModule } from 'primeng/button';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';

const routes: Routes = [
  { path: '', component: ItemComponent}
]

@NgModule({
  declarations: [ItemComponent],
  imports: [
    CommonModule,
    ImageModule,
    InputNumberModule,
    SkeletonLoadingModule,
    ItemsCardModule,
    FormsModule,
    FillQnrModule,
    AccordionModule,
    ButtonModule,
    ErrrorMessageModule,
    DropdownModule,
    AuthenticationModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ItemComponent
  ]
})
export class ItemModule { }

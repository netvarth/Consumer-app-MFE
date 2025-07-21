import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailsComponent } from './order-details.component';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { TimelineModule } from 'primeng/timeline';
import { MatButtonModule } from '@angular/material/button';
import { DialogService } from 'primeng/dynamicdialog';
import { OrderTemplatesModule } from '../order-templates/order-templates.module';

const routes:Routes = [
  {
    path:'',component:OrderDetailsComponent
  }
]

@NgModule({
  declarations: [
    OrderDetailsComponent
  ],
  imports: [
    CommonModule,
    LoadingSpinnerModule,
    ButtonModule,
    TimelineModule,
    MatButtonModule,
    OrderTemplatesModule,
    [RouterModule.forChild(routes)]
  ],
    providers: [DialogService]
})
export class OrderDetailsModule { }

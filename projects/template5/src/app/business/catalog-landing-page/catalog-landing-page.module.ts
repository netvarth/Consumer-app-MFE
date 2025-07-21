import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryModule } from "@ks89/angular-modal-gallery";
import { RouterModule, Routes } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CatalogLandingPageComponent } from './catalog-landing-page.component';
import { LoadingSpinnerModule } from 'jaldee-framework/spinner';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { CardModule } from '../../modules/card/card.module';
import { BasicProfileModule } from '../../modules/profile/basic-profile/basic-profile.module';
import { I8nModule } from '../../modules/i8n/i8n.module';

const routes: Routes = [
  { path: '', component: CatalogLandingPageComponent}
];

@NgModule({
  declarations: [
    CatalogLandingPageComponent
  ],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule,
    MatDialogModule,
    LoadingSpinnerModule,
    CarouselModule,
    CardModule,
    BasicProfileModule,
    GalleryModule,
    I8nModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    CatalogLandingPageComponent
  ]
})
export class CatalogLandingModule { }

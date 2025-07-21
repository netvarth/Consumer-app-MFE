import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PictureGalleryComponent } from './picture-gallery.component';
import { GalleryModule } from "@ks89/angular-modal-gallery";
import { NO_ERRORS_SCHEMA } from '@angular/core';


@NgModule({
  declarations: [
    PictureGalleryComponent
  ],
  imports: [
    CommonModule,
    GalleryModule
  ],
  exports: [
    PictureGalleryComponent
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class PictureGalleryModule { }

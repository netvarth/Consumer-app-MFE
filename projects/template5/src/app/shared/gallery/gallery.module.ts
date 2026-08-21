import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GalleryComponent } from './gallery.component';
import { GalleryService } from './galery-service';
import { GalleryImportModule } from './import/gallery-import.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { FormMessageDisplayModule, JGalleryModule } from 'jconsumer-shared';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        FormMessageDisplayModule,
        GalleryImportModule,
        JGalleryModule
    ],
    declarations: [GalleryComponent],
    exports: [GalleryComponent],
    providers: [GalleryService]
})

export class GalleryModule {}

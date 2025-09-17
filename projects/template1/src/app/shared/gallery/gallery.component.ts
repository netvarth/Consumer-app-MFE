import { OnInit, Component, EventEmitter, Output, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GalleryImportComponent } from './import/gallery-import.component';
import { Subscription } from 'rxjs';
import { GalleryService } from './galery-service';
import { JGalleryService, Messages } from 'jconsumer-shared';

@Component({
    selector: 'app-jaldee-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['gallery.component.scss']
})

export class GalleryComponent implements OnInit, OnChanges {
    @Output() action = new EventEmitter<any>();
    @Input() source_id;
    @Input() images;
    @Input() status;
    @Input() source;
    @Input() page;
    activeHeader;
    image_list: any = [];
    image_list_popup: any = [];
    galleryDialog;
    gallery_view_caption = Messages.GALLERY_CAP;
    havent_added_cap = Messages.BPROFILE_HAVE_NOT_ADD_CAP;
    add_now_cap = Messages.BPROFILE_ADD_IT_NOW_CAP;
    photo_cap = Messages.SERVICE_PHOTO_CAP;
    delete_btn = Messages.DELETE_BTN;
    subscription: Subscription;
    img_lst_lngth: any;
    constructor(private dialog: MatDialog,
        private jGalleryService: JGalleryService, private galleryService: GalleryService) {
    }
    editImageGallery() {
        // if (!this.service_data.id) { return false; }
        this.galleryDialog = this.dialog.open(GalleryImportComponent, {
            width: '50%',
            panelClass: ['popup-class', 'commonpopupmainclass'],
            disableClose: true,
            data: {
                type: 'edit',
                source_id: this.source_id || this.source
            }
        });
        this.galleryDialog.componentInstance.performUpload.subscribe(
            (imagelist_input) => {
                const input = {
                    'type': 'add',
                    'value': imagelist_input
                };
                this.action.emit(input);
            });
        this.galleryDialog.afterClosed().subscribe(result => {
            if (result === 'reloadlist') {
                // this.getGalleryImages();
            }
        });
    }
    ngOnChanges() {
        this.image_list = this.images || [];
        this.loadImages(this.image_list);
    }
    ngOnInit() {
        console.log("Image Gallery list : ", this.image_list)
    }
    loadImages(imagelist) {
        this.image_list_popup = [];
        if (imagelist.length > 0) {
            for (let i = 0; i < imagelist.length; i++) {
                let imgobj = {
                    source: imagelist[i].url,
                    thumb: imagelist[i].url,
                    alt: imagelist[i].caption || ''
                };
                this.image_list_popup.push(imgobj);
            }
        }
        this.img_lst_lngth = this.image_list_popup.length;
    }
    confirmDelete(file, indx) {
        const skey = this.image_list[indx].keyName;
        file.keyName = skey;
        this.galleryService.confirmGalleryImageDelete(this, file);
    }
    deleteImage(file, bypassgetgallery?) {
        const input = {
            'ttype': 'delete-image',
            'value': file.keyName,
            'bypassgetgallery': bypassgetgallery
        };
        this.galleryService.sendMessage(input);
    }
    private getCurrentIndexCustomLayout(image, images): number {
        return image ? images.indexOf(image) : -1;
    }
    openGallery(image): void {
        let imageIndex = this.getCurrentIndexCustomLayout(image, this.image_list_popup);
        this.jGalleryService.open(this.image_list_popup, imageIndex);
    }
}

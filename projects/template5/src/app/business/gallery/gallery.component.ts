import { OnInit, Component, EventEmitter, Output, Input, OnChanges } from '@angular/core';
import { ButtonEvent, Image, ButtonType, ButtonsStrategy, ButtonsConfig, ModalGalleryRef, ModalGalleryConfig, ModalLibConfig, ModalGalleryService } from '@ks89/angular-modal-gallery';
import { MatDialog } from '@angular/material/dialog';
import { GalleryImportComponent } from './import/gallery-import.component';
import { Subscription } from 'rxjs';
import { GalleryService } from './galery-service';
import { Messages } from 'jaldee-framework/constants';

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
    image_list_popup: Image[];
    galleryDialog;
    gallery_view_caption = Messages.GALLERY_CAP;
    havent_added_cap = Messages.BPROFILE_HAVE_NOT_ADD_CAP;
    add_now_cap = Messages.BPROFILE_ADD_IT_NOW_CAP;
    photo_cap = Messages.SERVICE_PHOTO_CAP;
    delete_btn = Messages.DELETE_BTN;
    subscription: Subscription;
    customButtonsFontAwesomeConfig: ButtonsConfig = {
        visible: true,
        strategy: ButtonsStrategy.CUSTOM,
        buttons: [
            {
                className: 'fa fa-trash-o',
                type: ButtonType.DELETE,
                ariaLabel: 'custom plus aria label',
                title: 'Delete',
                fontSize: '20px'
            },
            {
                className: 'inside close-image',
                type: ButtonType.CLOSE,
                ariaLabel: 'custom close aria label',
                title: 'Close',
                fontSize: '20px'
            }
        ]
    };
    img_lst_lngth: any;
    private buttonBeforeHookSubscription: Subscription | undefined;
    constructor(private dialog: MatDialog,
        private modalGalleryService: ModalGalleryService,
        private galleryService: GalleryService) {
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
        console.log("Image Gallery list : ",this.image_list)
    }
    loadImages(imagelist) {
        this.image_list_popup = [];
        if (imagelist.length > 0) {
            for (let i = 0; i < imagelist.length; i++) {
                const imgobj = new Image(
                    i,
                    { // modal
                        img: imagelist[i].url,
                        description: imagelist[i].caption || ''
                    });
                this.image_list_popup.push(imgobj);
            }
        }
        this.img_lst_lngth=this.image_list_popup.length;
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
    openImageModalRow(image: Image) {
        const index: number = this.getCurrentIndexCustomLayout(image, this.image_list_popup);
        this.openModal(1, index, this.customButtonsFontAwesomeConfig);
    }
    getCurrentIndexCustomLayout(image: Image, images: Image[]): number {
        return image ? images.indexOf(image) : -1;
    }
    openModal(id: number, imageIndex: number, buttonsConfig: ButtonsConfig): void {
        const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
            id: id,
            images: this.images,
            currentImage: this.images[imageIndex],
            libConfig: {
                buttonsConfig: buttonsConfig,
                // 'downloadable: true' is required to enable download button (if visible)
                currentImageConfig: {
                    downloadable: true
                }
            } as ModalLibConfig
        } as ModalGalleryConfig) as ModalGalleryRef;

        // required to enable ADD button
        this.buttonBeforeHookSubscription = dialogRef.buttonBeforeHook$.subscribe((event: ButtonEvent) => {
            if (!event || !event.button) {
                return;
            }
            // Invoked after a click on a button, but before that the related
            // action is applied.
            if (event.button.type === ButtonType.DELETE) {
                // remove the current image and reassign all other to the array of images
                let name = event.image.modal.img.toString();
                const knamearr = name.split('/');
                const kname = knamearr[(knamearr.length - 1)];
                const file = {
                    id: event.image.id,
                    keyName: kname,
                    modal: {
                        img: event.image.modal.img
                    },
                    plain: undefined
                };
                this.deleteImage(file, true);
                this.image_list_popup = this.image_list_popup.filter((val: Image) => event.image && val.id !== event.image.id);
            }
        });
    }
}

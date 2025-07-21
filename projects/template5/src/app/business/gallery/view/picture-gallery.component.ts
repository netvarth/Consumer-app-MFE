import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Image } from '@ks89/angular-modal-gallery';

@Component({
  selector: 'app-picture-gallery',
  templateUrl: './picture-gallery.component.html',
  styleUrls: ['./picture-gallery.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class PictureGalleryComponent implements OnInit {

  @Input() galleryJson;

  galleryImages: any = [];

  constructor() { }

  ngOnInit(): void {
    if (this.galleryJson.length > 0) {
      for (let i = 0; i < this.galleryJson.length; i++) {
        const imgobj = new Image(i, { img: this.galleryJson[i].url, description: this.galleryJson[i].caption || '' });
        this.galleryImages.push(imgobj);
      }
    }
    console.log(this.galleryImages);
  }
}

import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-qrcodegenerator',
  templateUrl: './qrcodegeneratordetail.component.html',
  styleUrls: ['./qrcodegeneratordetail.component.css']
})
export class QRCodeGeneratordetailComponent implements OnInit {
  elementType: any = 'url';
  accuid: any;
  bname: any;
  busername: any;
  about: any;
  qr_code_cId = false;
  qr_code_oId = false;
  qr_value: any;
  qrCodePath: any;
  wpath: any;
  description: any;
  shareLink: any;
  window_path: any;
  customId: any;
  userId: any;
  theme: any;
  readMore = false;
  @ViewChild('qrcodeElem', { static: false }) qrcodeElem!: ElementRef;
  constructor(private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<QRCodeGeneratordetailComponent>,
    private angular_meta: Meta,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  private qrCodeParent: any;
  @ViewChild('qrCodeOnlineId', { read: ElementRef }) set content1(content1: ElementRef) {
    if (content1) { // initially setter gets called with undefined
      this.qrCodeParent = content1;
    }
  }
  ngOnInit() {
    this.theme = this.data.theme;
    this.accuid = this.data.accencUid;
    this.wpath = this.data.path;
    this.bname = this.data.businessName;
    this.about = this.data.businessDesc;
    this.busername = this.data.businessUserName;
    this.customId = this.data.customId;
    this.userId = this.data.userId;
    if (this.userId) {
      this.shareLink = this.wpath + this.accuid + '/' + this.userId + '/';
    } else {
      this.shareLink = this.wpath + this.accuid + '/';
    }
    this.description = 'For bookings use this link';
    this.qrCodegenerateOnlineID(this.accuid, this.userId);
  }
  qrCodegenerateOnlineID(valuetogenerate: any, userid?: any) {
    if (userid) {
      this.qr_value = this.data.path + valuetogenerate + '/' + userid + "/";
    } else {
      this.qr_value = this.data.path + valuetogenerate + "/";
    }
    this.qr_code_oId = true;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.qrCodePath = this.qrCodeParent.nativeElement.getElementsByTagName('img')[0]?.src;
      this.angular_meta.addTags([
        { property: 'og:title', content: this.data.businessName },
        // { property: 'og:image', content: this.imageUrl },
        { property: 'og:type', content: 'link' },
        { property: 'og:description', content: this.description },

      ]);
    }, 50);
  }
  downloadQRCode(): void {
    const canvas = document.querySelector('#print-section canvas') as HTMLCanvasElement;

    if (canvas) {
      const imgDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgDataUrl;
      link.download = 'qr-code.png';
      link.click();
    } else {
      console.warn('QR code canvas not found.');
    }
  }
  showSpec() {
    if (this.readMore) {
      this.readMore = false;
    } else {
      this.readMore = true;
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { AccessibilityConfig, Image, ImageEvent } from '@ks89/angular-modal-gallery';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { SubSink } from 'subsink';
import { AccountService } from '../../services/account-service';
import { ConsumerService } from '../../services/consumer-service';
import { LocalStorageService } from 'jaldee-framework/storage/local';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit, OnDestroy {

  itemImages: any;
  customOptions: any;
  itemId: any;
  currentItem: any;
  orderList: any = [];
  imageIndex = 1;
  galleryId = 1;
  autoPlay = true;
  showArrows = true;
  showDots = true;
  imagesRect: Image[] = new Array<Image>();
  accessibilityConfig: AccessibilityConfig = {
    backgroundAriaLabel: 'CUSTOM Modal gallery full screen background',
    backgroundTitle: 'CUSTOM background title',

    plainGalleryContentAriaLabel: 'CUSTOM Plain gallery content',
    plainGalleryContentTitle: 'CUSTOM plain gallery content title',

    modalGalleryContentAriaLabel: 'CUSTOM Modal gallery content',
    modalGalleryContentTitle: 'CUSTOM modal gallery content title',

    loadingSpinnerAriaLabel: 'CUSTOM The current image is loading. Please be patient.',
    loadingSpinnerTitle: 'CUSTOM The current image is loading. Please be patient.',

    mainContainerAriaLabel: 'CUSTOM Current image and navigation',
    mainContainerTitle: 'CUSTOM main container title',
    mainPrevImageAriaLabel: 'CUSTOM Previous image',
    mainPrevImageTitle: 'CUSTOM Previous image',
    mainNextImageAriaLabel: 'CUSTOM Next image',
    mainNextImageTitle: 'CUSTOM Next image',

    dotsContainerAriaLabel: 'CUSTOM Image navigation dots',
    dotsContainerTitle: 'CUSTOM dots container title',
    dotAriaLabel: 'CUSTOM Navigate to image number',

    previewsContainerAriaLabel: 'CUSTOM Image previews',
    previewsContainerTitle: 'CUSTOM previews title',
    previewScrollPrevAriaLabel: 'CUSTOM Scroll previous previews',
    previewScrollPrevTitle: 'CUSTOM Scroll previous previews',
    previewScrollNextAriaLabel: 'CUSTOM Scroll next previews',
    previewScrollNextTitle: 'CUSTOM Scroll next previews',

    carouselContainerAriaLabel: 'Current image and navigation',
    carouselContainerTitle: '',
    carouselPrevImageAriaLabel: 'Previous image',
    carouselPrevImageTitle: 'Previous image',
    carouselNextImageAriaLabel: 'Next image',
    carouselNextImageTitle: 'Next image',
    carouselPreviewsContainerAriaLabel: 'Image previews',
    carouselPreviewsContainerTitle: '',
    carouselPreviewScrollPrevAriaLabel: 'Scroll previous previews',
    carouselPreviewScrollPrevTitle: 'Scroll previous previews',
    carouselPreviewScrollNextAriaLabel: 'Scroll next previews',
    carouselPreviewScrollNextTitle: 'Scroll next previews'
  };
  private subs = new SubSink();
  from: string;
  account: any;
  accountConfig: any;
  theme: any;
  accountProfile: any;
  accountId: any;
  customId: any;
  constructor(
    private location: Location,
    private lStorageService: LocalStorageService,
    private router: Router,
    private accountService: AccountService,
    private consumerService: ConsumerService,
    public route: ActivatedRoute) { }

  ngOnInit() {
    const _this = this;
    _this.account = _this.accountService.getAccountInfo();
    _this.accountConfig = _this.accountService.getAccountConfig();
    if (_this.accountConfig && _this.accountConfig['theme']) {
      _this.theme = _this.accountConfig['theme'];
    }
    _this.accountProfile = _this.accountService.getJson(_this.account['businessProfile']);
    _this.accountId = _this.accountProfile.id;
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    const orderList = JSON.parse(this.lStorageService.getitemfromLocalStorage('order'));
    if (orderList) {
      this.orderList = orderList;
    }
    this.route.queryParams.subscribe(qparams => {
      if (qparams['isFrom'] && qparams['isFrom'] == 'providerdetail') {
        this.from = 'providerdetail';
      };
    });
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  checkout() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        isFrom: this.from ? this.from : ''
      }
    };
    this.lStorageService.setitemonLocalStorage('order', this.orderList);
    this.router.navigate(['order/shoppingcart'], navigationExtras);
  }
  getItemQty() {
    const orderList = this.orderList;
    let qty = 0;
    if (orderList !== null && orderList.filter(i => i.itemId === this.currentItem.itemId)) {
      qty = orderList.filter(i => i.itemId === this.currentItem.itemId).length;
    }
    return qty;
  }
  increment() {
    this.addToCart();
  }
  goBack() {
    this.lStorageService.setitemonLocalStorage('order', this.orderList);
    this.location.back();
  }

  decrement() {
    this.removeFromCart();
  }
  addToCart() {
    this.orderList.push(this.currentItem);
    this.lStorageService.setitemonLocalStorage('order', this.orderList);
    this.getItemQty();

  }
  removeFromCart() {
    for (const i in this.orderList) {
      if (this.orderList[i].itemId === this.currentItem.itemId) {
        this.orderList.splice(i, 1);
        this.lStorageService.setitemonLocalStorage('order', this.orderList);
        break;
      }
    }
    this.getItemQty();
  }
  // output evets
  onShow(event: ImageEvent) {
  }

  onFirstImage(event: ImageEvent) {
  }

  onLastImage(event: ImageEvent) {
  }
}

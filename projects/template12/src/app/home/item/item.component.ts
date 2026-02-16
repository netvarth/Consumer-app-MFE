import { Location } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  AccountService,
  AuthService,
  ConsumerService,
  ErrorMessagingService,
  GroupStorageService,
  LocalStorageService,
  OrderService,
  SharedService,
  SubscriptionService,
  ToastService
} from 'jconsumer-shared';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FillQnrComponent } from '../fill-qnr/fill-qnr.component';
import { ItemService } from './item.service';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../shared/wishlist.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent implements OnInit, OnDestroy {
  loggedIn: boolean = true;
  isLogin: boolean = false;
  quantity: number = 1; // Initial quantity
  sizes = [
    {
      size: '160 g',
    },
    {
      size: 'Pack of 2 (160 g each)',
    },
    {
      size: 'Pack of 3 (160 g each)',
    }
  ]
  selectedSize: any;
  item: any;
  orderItem: any = [];
  cartId: any;
  loading: any = false;
  loggedUser: any;
  account: any;
  accountProfile: any;
  accountId: any;
  itemEncid: any;
  storeEncId: any;
  items: any = [];
  itemsCount: any = [];
  action!: string;
  selectedItemImage: any;
  isVideoMuted: boolean = true;
  isVideoReady: boolean = false;
  config: any;
  theme: any;
  isCartCreated: boolean = false;
  prevItem: any;
  questionnaireList: any;
  itemId: any;
  itemEncId: any;
  itemOptionsRef!: DynamicDialogRef;
  questionAnswers: any;
  spItemCategoryId: any;
  safeHtml: any;
  shortDescHtml: any;
  readMore = false;
  showFullContent = false;
  badges: any;
  isSessionCart: any;
  orderList: any = [];
  deliveryType: any;
  tempOrderList: any;
  cdnPath: string = '';
  selectedValues: { [key: string]: string } = {};
  itemAttributes: any;
  virtualItem = false;
  virtualItemOutOfStock = false;
  thumbnailAttachments: any[] = [];
  private subscriptions: Subscription = new Subscription();
  pinCode: any;
  pinCodeResponse: any;
  shipmentData: any;
  deliveryAvailability: string = '';
  showDeliveryAvailability: boolean = false;
  showDeliveryUnAvailability: boolean = false;
  showCheckDeliveryAvailability: boolean = false;
  deliveryOptions = [
    {
      label: 'Home Delivery',
      value: 'HOME_DELIVERY',
      icon: 'assets/images/homed.svg'
    },
    {
      label: 'Store Pickup',
      value: 'STORE_PICKUP',
      icon: 'assets/images/storep.svg'
    }
  ];
  itemDeliveryType: any;
  isSmallDevice: boolean;
  hidePrices: boolean = false;
  cartDisabled: boolean = false;
  itemTypes: Array<{ id: number; typeName?: string; name?: string }> = [];
  itemGroups: Array<{ id: number | string; groupName?: string; name?: string }> = [];
  isShareSheetOpen: boolean = false;
  mediaLoading: boolean = false;
  private mediaLoadToken = 0;
  private readonly minItemLoadMs = 1000;
  private itemLoadToken = 0;

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 768) {
      this.isSmallDevice = true;
    }
  }
  constructor(
    private sharedService: SharedService,
    private orderService: OrderService,
    private itemService: ItemService,
    private subscriptionService: SubscriptionService,
    private groupService: GroupStorageService,
    private router: Router,
    private accountService: AccountService,
    private authService: AuthService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private lStorageService: LocalStorageService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private sanitizer: DomSanitizer,
    private errorService: ErrorMessagingService,
    private consumerService: ConsumerService,
    private wishlistService: WishlistService,
    private titleService: Title,
    private metaService: Meta,

  ) {
    this.onResize();
    this.cdnPath = this.sharedService.getCDNPath();
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    if (!this.loggedUser?.providerConsumer) {
      this.wishlistService.clear();
    }
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.accountId = this.sharedService.getAccountID();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  private resolveStoreContext(): boolean {
    const activeStore = this.accountService.getActiveStore();
    const storedEncId = this.lStorageService.getitemfromLocalStorage('storeEncId');
    const stores = this.accountService.getStores ? this.accountService.getStores() : [];
    const fallbackStore = Array.isArray(stores) && stores.length ? stores[0] : null;
    const resolvedEncId = activeStore || storedEncId || fallbackStore?.encId || null;

    if (!resolvedEncId) {
      return false;
    }

    this.storeEncId = resolvedEncId;
    this.lStorageService.setitemonLocalStorage('storeEncId', resolvedEncId);
    this.accountService.setActiveStore(resolvedEncId);
    if (fallbackStore?.id) {
      this.lStorageService.setitemonLocalStorage('storeId', fallbackStore.id);
    }
    return true;
  }

  scrollToElement(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 500);
  }
  itemActionPerformed(itemID: any) {
    this.getSoCatalogItemById(itemID);
    this.quantity = 1;
    this.isCartCreated = false;
    this.scrollToElement('itemContainer');
  }
  cartModalActionPerformed(event: any) {
    if (event) {
      this.isCartCreated = false;
    }
  }
  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    this.getShipmentSettings();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    let accountConfig = this.sharedService.getAccountConfig();
    if (accountConfig) {
      this.cartDisabled = accountConfig['cartDisabled'] || false;
      this.hidePrices = accountConfig['hidePrice'] || false;
    }
    let subs = this.activatedRoute.params.subscribe((params: any) => {
      if (params && params['id']) {
        if (this.prevItem != params['id']) {
          this.itemEncid = params['id']
          this.virtualItem = false;
          // Reset selected image when navigating to a new item
          this.selectedItemImage = null;
          this.getSoCatalogItemById(this.itemEncid);
          this.prevItem = this.itemEncid;
          this.scrollToElement('itemContainer');
        }
      }
      this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart')
      setTimeout(() => {
        if (this.resolveStoreContext()) {
          this.getSoCatalogItems()
        }
        this.processPendingWishlist();
        this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
      }, 200);
    })
    this.subscriptions.add(subs);
    this.loadItemTypes();
    this.loadItemGroups();
    this.loadWishlistState();
  }

  onInputFocus(event: any): void {
    event.target.blur();
  }
  setHtmlContent(content: any) {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(content);
  }

  setShortDesc(content: string) {
    const html = content ? content.replace(/\n/g, '<br>') : '';
    this.shortDescHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }
  selectSize(size: number) {
    this.selectedSize = size;
  }
  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate([this.sharedService.getRouteID()]);
  }

  goProducts() {
    this.viewAll();
  }
  getSoCatalogItems() {
    if (!this.resolveStoreContext()) {
      this.loading = false;
      return;
    }
    this.loading = true;
    let filter: any = {};
    filter['accountId-eq'] = this.accountId;
    filter['storeEncId-eq'] = this.storeEncId;
    filter['from'] = 0;
    filter['count'] = 25;
    if (this.spItemCategoryId) {
      filter['spItemCategoryId-eq'] = this.spItemCategoryId;
    }
    filter['parentItemId-eq'] = 0;
    let sub1 = this.orderService.getStoreCatalogItems(filter).subscribe((items: any) => {
      this.items = items;
      this.loading = false;
    }, (error: any) => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    })
    this.subscriptions.add(sub1);
    let sub2 = this.orderService.getStoreCatalogItemsCount(filter).subscribe((count: any) => {
      this.itemsCount = count;
      this.loading = false;
    }, (error: any) => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    })
    this.subscriptions.add(sub2);
  }

  private loadItemTypes(): void {
    const sub = this.orderService.getItemType(this.accountId).subscribe(
      (types: any) => {
        this.itemTypes = Array.isArray(types) ? types : [];
      },
      () => {
        this.itemTypes = [];
      }
    );
    this.subscriptions.add(sub);
  }

  private loadItemGroups(): void {
    const sub = this.orderService.getItemGroup(this.accountId).subscribe(
      (groups: any) => {
        this.itemGroups = Array.isArray(groups) ? groups : [];
      },
      () => {
        this.itemGroups = [];
      }
    );
    this.subscriptions.add(sub);
  }

  getItemTypeName(itemTypeId?: number): string {
    if (!itemTypeId) {
      return '';
    }
    const match = this.itemTypes.find((type) => type.id === itemTypeId);
    return match?.typeName || match?.name || '';
  }

  getDisplayItemTypeName(): string {
    const virtualType =
      this.itemAttributes?.spItemDto?.itemType?.typeName
      || this.getItemTypeName(this.itemAttributes?.spItemDto?.itemType?.id);
    if (virtualType) {
      return virtualType;
    }
    return this.item?.spItemDto?.itemType?.typeName
      || this.getItemTypeName(this.item?.spItemDto?.itemType?.id);
  }

  getDisplayItemGroups(): string[] {
    const groups = this.itemAttributes?.spItemDto?.itemGroups
      || this.item?.spItemDto?.itemGroups
      || [];
    const groupValues = Array.isArray(groups)
      ? groups
      : (typeof groups === 'string' ? groups.split(',').map((group) => group.trim()) : []);

    const getGroupNameById = (id: any): string => {
      const matchedGroup = this.itemGroups.find(
        (itemGroup) => String(itemGroup.id) === String(id)
      );
      return (matchedGroup?.groupName || matchedGroup?.name || '').trim();
    };

    return groupValues
      .map((group: any) => {
        if (!group) {
          return '';
        }
        if (typeof group === 'object') {
          const explicitName = (group.groupName || group.name || '').trim();
          if (explicitName) {
            return explicitName;
          }
          if (group.id !== undefined && group.id !== null) {
            return getGroupNameById(group.id) || String(group.id);
          }
          return '';
        }
        return getGroupNameById(group) || String(group);
      })
      .filter((groupName: string) => !!groupName);
  }

  viewAll() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        accountId: this.accountId,
        storeEncId: this.storeEncId,
        target: 'itemDetails'
      }
    }
    this.router.navigate([this.sharedService.getRouteID(), 'items'], navigationExtras)
  }

  getSoCatalogItemById(itemID: any) {
    // Prevent multiple simultaneous calls for the same item
    if (this.loading && this.itemEncid === itemID) {
      return;
    }
    const loadToken = ++this.itemLoadToken;
    const loadStart = Date.now();
    this.loading = true;
    let sub = this.orderService.getSoCatalogItemById(this.accountId, itemID).subscribe((itemData: any) => {
      if (itemData) {
        this.item = itemData;
        this.setMetaTagsFromItem(itemData);
        if (itemData && itemData.spItemDto && itemData.spItemDto.id) {
          this.itemId = itemData.spItemDto.id;
        }
        if (itemData && itemData.spItem && itemData.spItem.encId) {
          this.itemEncId = itemData.spItem.encId;
        }
        if (itemData?.spItemDto?.itemCategory?.id) {
          this.spItemCategoryId = itemData.spItemDto.itemCategory.id;
        }
        // Store the initial image from main item
        const initialImage = itemData && itemData.spItemDto && itemData.spItemDto.attachments && itemData.spItemDto.attachments.length > 0
          ? itemData.spItemDto.attachments[0]
          : { s3path: (this.cdnPath + 'assets/images/rx-order/items/Items.svg') };
        
        // Only set image if not already set or if this is a fresh load
        if (!this.selectedItemImage || this.itemEncid !== itemID) {
          this.selectedItemImage = initialImage;
          this.updateVideoState(this.selectedItemImage);
          this.trackSelectedMediaLoad(this.selectedItemImage);
        }
        this.updateThumbnailAttachments();
        
        if (itemData && itemData.spItemDto && itemData.spItemDto.badges && itemData.spItemDto.badges.length > 0) {
          this.badges = itemData.spItemDto.badges;
        }
        if (this.item && this.item.itemAttributes && this.item.itemAttributes.length > 0) {
          this.initializeSelectedValues();
        } else {
          if (itemData && itemData.homeDelivery && this.itemDeliveryType != 'STORE_PICKUP') {
            this.itemDeliveryType = 'HOME_DELIVERY'
          } else {
            this.itemDeliveryType = 'STORE_PICKUP'
          }
        }
        console.log('itemData1', this.item)
        this.finishItemLoading(loadToken, loadStart);
        const mainDesc = this.item?.spItemDto?.internalDesc || this.item?.internalDesc || '';
        if (mainDesc) {
          this.setHtmlContent(mainDesc);
        }
        const mainShortDesc = this.item?.spItemDto?.shortDesc || this.item?.spItem?.description || '';
        if (mainShortDesc) {
          this.setShortDesc(mainShortDesc);
        } else {
          this.shortDescHtml = null;
        }
      }
    }, (error: any) => {
      this.finishItemLoading(loadToken, loadStart);
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    })
    this.subscriptions.add(sub);
  }

  private finishItemLoading(token: number, startTime: number): void {
    const elapsed = Date.now() - startTime;
    const remaining = this.minItemLoadMs - elapsed;
    if (remaining > 0) {
      setTimeout(() => {
        if (this.itemLoadToken === token) {
          this.loading = false;
        }
      }, remaining);
      return;
    }
    if (this.itemLoadToken === token) {
      this.loading = false;
    }
  }
  actionPerformed(event: any) {
    this.addToCart(this.action);
  }

  private loadWishlistState(): void {
    const providerConsumerId = this.loggedUser?.providerConsumer;
    if (!providerConsumerId) {
      return;
    }
    const sub = this.wishlistService.getallWishlistItems(providerConsumerId).subscribe(
      (wishlistItems: any) => {
        const list = this.extractWishlistItems(wishlistItems);
        list.forEach((wish) => {
          const itemEncId = wish?.catalogItem?.encId;
          if (!itemEncId) {
            return;
          }
          if (!this.wishlistService.isWishlisted(itemEncId)) {
            this.wishlistService.add({ encId: itemEncId });
          }
          if (wish?.id) {
            this.wishlistService.setWishlistItemUid(itemEncId, wish.id);
          }
          const spCode = wish?.spItem?.spCode;
          if (spCode) {
            this.wishlistService.setWishlistItemSpCode(itemEncId, spCode);
          }
        });
      },
      () => { }
    );
    this.subscriptions.add(sub);
  }

  private extractWishlistItems(wishlistItems: any): any[] {
    if (!Array.isArray(wishlistItems)) {
      return [];
    }
    const hasWrappedItems = wishlistItems.some((entry) => Array.isArray(entry?.items));
    if (hasWrappedItems) {
      return wishlistItems.reduce((acc: any[], entry: any) => {
        if (Array.isArray(entry?.items)) {
          acc.push(...entry.items);
        }
        return acc;
      }, []);
    }
    
    return wishlistItems;
  }

  private processPendingWishlist(): void {
    const pending = this.lStorageService.getitemfromLocalStorage('pendingWishlistItem');
    if (!pending || !pending.encId) {
      return;
    }
    if (!this.loggedUser?.providerConsumer || !this.resolveStoreContext()) {
      return;
    }
    const wishlistItemEncId = pending.encId;
    if (this.wishlistService.isWishlisted(wishlistItemEncId)) {
      this.lStorageService.removeitemfromLocalStorage('pendingWishlistItem');
      return;
    }
    const payload = {
      store: {
        encId: this.storeEncId
      },
      providerConsumer: {
        id: this.loggedUser.providerConsumer
      },
      deliveryType: pending.deliveryType || this.itemDeliveryType || this.deliveryType,
      items: [
        {
          catalogItem: {
            encId: wishlistItemEncId
          },
          quantity: 1
        }
      ],
      orderCategory: 'SALES_ORDER',
      orderSource: 'PROVIDER_CONSUMER'
    };
    this.lStorageService.removeitemfromLocalStorage('pendingWishlistItem');
    const sub = this.wishlistService.addToWishlist(payload).subscribe(
      (response: any) => {
        this.wishlistService.add({ encId: wishlistItemEncId });
        const wishlistUid = response?.id || response?.items?.[0]?.id;
        if (wishlistUid) {
          this.wishlistService.setWishlistItemUid(wishlistItemEncId, wishlistUid);
        }
        this.toastService.showSuccess('Added to wishlist');
      },
      (error) => {
        const errorObj = this.errorService.getApiError(error);
        const message = errorObj?.error || errorObj?.message || errorObj?.msg || '';
        if (typeof message === 'string' && message.toLowerCase().includes('already added to wishlist')) {
          this.wishlistService.add({ encId: wishlistItemEncId });
          return;
        }
        this.toastService.showError(errorObj);
      }
    );
    this.subscriptions.add(sub);
  }

  private setMetaTagsFromItem(itemData: any): void {
    if (!itemData) {
      return;
    }
    const title =
      itemData?.spItemDto?.name ||
      itemData?.spItem?.name ||
      itemData?.name ||
      'Product';
    const description =
      itemData?.spItemDto?.shortDesc ||
      itemData?.spItem?.description ||
      itemData?.shortDesc ||
      '';
    const image =
      itemData?.spItemDto?.attachments?.[0]?.s3path ||
      itemData?.spItem?.attachments?.[0]?.s3path ||
      this.cdnPath + 'assets/images/rx-order/items/Items.svg';
    const url = window.location.href;

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description || '' });
    this.metaService.updateTag({ name: 'keywords', content: title || 'Webpage' });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ property: 'og:title', content: title || '' });
    this.metaService.updateTag({ property: 'og:site_name', content: title || '' });
    this.metaService.updateTag({ property: 'og:description', content: description || '' });
    this.metaService.updateTag({ property: 'og:image', content: image || '' });
    this.metaService.updateTag({ property: 'og:url', content: url });
  }

  private getCurrentCatalogEncId(): string | undefined {
    return this.virtualItem ? this.itemAttributes?.encId : this.item?.encId;
  }

  private getCurrentSpItemEncId(): string | undefined {
    return this.virtualItem
      ? (this.itemAttributes?.spItem?.encId || this.itemAttributes?.encId)
      : (this.item?.spItem?.encId || this.item?.encId);
  }

  private getCurrentSpItemCode(): string | undefined {
    return this.virtualItem
      ? (this.itemAttributes?.spItem?.spCode || this.itemAttributes?.spItemDto?.spCode || this.itemAttributes?.spCode)
      : (this.item?.spItem?.spCode || this.item?.spItemDto?.spCode || this.item?.spCode);
  }

  private resolveWishlistDeliveryType(): 'HOME_DELIVERY' | 'STORE_PICKUP' {
    const homeDelivery =
      this.itemAttributes?.homeDelivery ??
      this.itemAttributes?.spItemDto?.homeDelivery ??
      this.itemAttributes?.spItem?.homeDelivery ??
      this.item?.homeDelivery ??
      this.item?.spItemDto?.homeDelivery ??
      this.item?.spItem?.homeDelivery;
    return homeDelivery ? 'HOME_DELIVERY' : 'STORE_PICKUP';
  }

  isWishlisted(): boolean {
    const itemEncId = this.getCurrentCatalogEncId();
    return this.wishlistService.isWishlisted(itemEncId);
  }

  onWishlist(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    const catalogEncId = this.getCurrentCatalogEncId();
    const spItemEncId = this.getCurrentSpItemEncId();
    const spItemCode = this.getCurrentSpItemCode();
    if (!catalogEncId) {
      return;
    }
    if (this.isWishlisted()) {
      const providerConsumerId = this.loggedUser?.providerConsumer;
      const delete$ = spItemCode
        ? this.wishlistService.deleteWishlistItemBySpCode(spItemCode)
        : this.wishlistService.deleteWishlistItemByItemEncId(catalogEncId, providerConsumerId);
      const sub = delete$.subscribe(
        () => {
          this.wishlistService.removeFromWishlist(catalogEncId);
          this.toastService.showSuccess('Removed from wishlist');
        },
        (error) => {
          const errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
      this.subscriptions.add(sub);
      return;
    }
    const proceed = () => {
      const providerConsumerId = this.loggedUser?.providerConsumer;
      if (!providerConsumerId || !this.storeEncId) {
        return;
      }
      const payload = {
        store: {
          encId: this.storeEncId
        },
        providerConsumer: {
          id: providerConsumerId
        },
        items: [
          {
            catalogItem: {
              encId: catalogEncId
            },
            quantity: 1
          }
        ],
        deliveryType: this.itemDeliveryType || this.deliveryType,
        orderCategory: 'SALES_ORDER',
        orderSource: 'PROVIDER_CONSUMER'
      };
      const sub = this.wishlistService.addToWishlist(payload).subscribe(
        (response: any) => {
          this.wishlistService.add({ encId: catalogEncId });
          const wishlistUid = response?.id || response?.items?.[0]?.id;
          if (wishlistUid) {
            this.wishlistService.setWishlistItemUid(catalogEncId, wishlistUid);
          }
          this.toastService.showSuccess('Added to wishlist');
        },
        (error) => {
          const errorObj = this.errorService.getApiError(error);
          const message = errorObj?.error || errorObj?.message || errorObj?.msg || '';
          if (typeof message === 'string' && message.toLowerCase().includes('already added to wishlist')) {
            this.wishlistService.add({ encId: catalogEncId });
            this.loadWishlistState();
            return;
          }
          this.toastService.showError(errorObj);
        }
      );
      this.subscriptions.add(sub);
    };

    if (!this.loggedUser?.providerConsumer) {
      const target = this.router.url || (this.sharedService.getRouteID() + '/item/' + (this.itemEncid || ''));
      this.lStorageService.setitemonLocalStorage('target', target);
      this.lStorageService.setitemonLocalStorage('pendingWishlistItem', {
        encId: catalogEncId,
        deliveryType: this.itemDeliveryType || this.deliveryType || this.resolveWishlistDeliveryType()
      });
      this.router.navigate([this.sharedService.getRouteID(), 'login']);
      return;
    }
    proceed();
  }
  setSelectedItemImage(item: any) {
    this.selectedItemImage = item;
    this.updateVideoState(item);
    this.trackSelectedMediaLoad(item);
  }

  handleImageError(event: any) {
    // Fallback to default image if image fails to load
    if (this.isVideoAttachment(this.selectedItemImage)) {
      return;
    }
    if (this.selectedItemImage && this.selectedItemImage.s3path !== (this.cdnPath + 'assets/images/rx-order/items/Items.svg')) {
      this.selectedItemImage = { s3path: (this.cdnPath + 'assets/images/rx-order/items/Items.svg') };
      // Trigger change detection
      setTimeout(() => {
        event.target.src = this.selectedItemImage.s3path;
        this.trackSelectedMediaLoad(this.selectedItemImage);
      }, 0);
    }
  }

  handleThumbnailError(event: any, attachment: any) {
    // Set fallback image for thumbnail if it fails to load
    event.target.src = this.cdnPath + 'assets/images/rx-order/items/Items.svg';
  }

  private finishAddToCartLoading(scrollY: number): void {
   
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
      });
    }
     this.loading = false;
  }

  addToCart(param?: string | null) {
    const _this = this;
    const preservedScrollY =
      typeof window !== 'undefined'
        ? (window.scrollY || document.documentElement.scrollTop || 0)
        : 0;
    this.loading = true;
    let item = this.item
    if (this.virtualItem == true) {
      item = this.itemAttributes;
    } else {
      item = this.item;
    }
    const isVirtual =
      this.item?.itemNature === 'VIRTUAL_ITEM' ||
      this.item?.spItemDto?.itemNature === 'VIRTUAL_ITEM' ||
      (Array.isArray(this.item?.itemAttributes) && this.item.itemAttributes.length > 0);
    if (isVirtual) {
      this.virtualItem = true;
      if (!this.itemAttributes || !this.itemAttributes.encId) {
        this.finishAddToCartLoading(preservedScrollY);
        this.toastService.showError('Please select item attributes');
        return;
      }
      if (this.itemAttributes?.stockStatus === 'OUT_OF_STOCK') {
        this.finishAddToCartLoading(preservedScrollY);
        this.toastService.showError('Selected attribute is out of stock');
        return;
      }
      item = this.itemAttributes;
    }
    if (!this.itemDeliveryType) {
      if (item && item.homeDelivery && this.itemDeliveryType != 'STORE_PICKUP') {
        this.itemDeliveryType = 'HOME_DELIVERY';
      } else {
        this.itemDeliveryType = 'STORE_PICKUP';
      }
    }
    this.authService.goThroughLogin().then((status: any) => {
      if (status) {
        _this.loggedIn = true;
        _this.loggedUser = _this.groupService.getitemFromGroupStorage('jld_scon');
        _this.isLogin = false;
        let subs = this.orderService.getQnrOrder(this.itemId).subscribe(
          (data: any) => {
            if (data) {
              this.questionnaireList = data;
              const navigationExtras: NavigationExtras = {
                queryParams: {
                  deliveryType: this.itemDeliveryType
                }
              }
              console.log(this.questionnaireList)
              if (this.questionnaireList && this.questionnaireList.questionnaireId) {
                this.itemOptionsRef = this.dialogService.open(FillQnrComponent, {
                  width: '90%',
                  contentStyle: { "max-height": "500px", "overflow": "auto" },
                  baseZIndex: 10000,
                  data: this.questionnaireList
                });
                this.itemOptionsRef.onClose.subscribe((result: any) => {
                  console.log(result)
                  if (result !== undefined) {
                    this.questionAnswers = result
                    if (this.questionAnswers.answers.answerLine && this.questionAnswers.answers.answerLine.length > 0) {
                      this.lStorageService.setitemonLocalStorage('serviceOPtionInfo', this.questionAnswers);
                      _this.createCart().then(data => {
                        _this.cartId = data;
                        if (param) {
                          _this.router.navigate([_this.sharedService.getRouteID(), 'order', 'checkout'], navigationExtras)
                          _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                        } else {
                          _this.loggedIn = true;
                          _this.finishAddToCartLoading(preservedScrollY);
                          _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                          _this.toastService.showSuccess("Item added to cart");
                          this.setAnalytics('addToCart')
                        }
                      })
                    }
                  } else {
                    _this.createCart().then(data => {
                      _this.cartId = data;
                      if (param) {
                        _this.router.navigate([_this.sharedService.getRouteID(), 'order', 'checkout'], navigationExtras)
                        _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                      } else {
                        _this.loggedIn = true;
                        _this.finishAddToCartLoading(preservedScrollY);
                        _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                        _this.toastService.showSuccess("Item added to cart");
                        this.setAnalytics('addToCart')
                      }
                    })
                  }
                });
              }
              else {
                _this.createCart().then(data => {
                  _this.cartId = data;
                  if (param) {
                    _this.router.navigate([_this.sharedService.getRouteID(), 'order', 'checkout'], navigationExtras)
                    _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                    _this.lStorageService.removeitemfromLocalStorage('cartData')
                    _this.lStorageService.removeitemfromLocalStorage('deliveryType')
                  } else {
                    _this.loggedIn = true;
                    _this.finishAddToCartLoading(preservedScrollY);
                    _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                    _this.toastService.showSuccess("Item added to cart");
                    this.setAnalytics('addToCart')
                  }
                })
              }
            }
          }, (error: any) => {
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);
          });
        this.subscriptions.add(subs);
      } else {
        if (!this.isSessionCart && !param) {
          const cartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
            HOME_DELIVERY: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 },
            STORE_PICKUP: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 }
          };
          const deliveryType = this.itemDeliveryType == 'HOME_DELIVERY' ? 'HOME_DELIVERY' : 'STORE_PICKUP';
          const targetCart = cartData[deliveryType];
          const orderList = targetCart.items;
          const existingItem = orderList.find((orderItem: any) => orderItem.encId === item.encId);
          if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + this.quantity;
            existingItem.netTotal = existingItem.quantity * (existingItem.taxableAmount || 0);
            existingItem.totalTaxAmount = existingItem.quantity * (existingItem.taxAmount || 0);
            existingItem.netRate = existingItem.quantity * (existingItem.price || 0);
          } else {
            const newItem = {
              ...item,
              quantity: this.quantity,
              price: item.price || 0,
              netTotal: this.quantity * (item.taxableAmount || 0),
              totalTaxAmount: this.quantity * (item.taxAmount || 0),
              netRate: this.quantity * (item.price || 0)
            };
            orderList.push(newItem);
          }
          // Recalculate totals for the current delivery type
          targetCart.netTotal = orderList.reduce((total, i) => total + i.netTotal, 0);
          targetCart.taxTotal = orderList.reduce((total, i) => total + i.totalTaxAmount, 0);
          targetCart.netRate = orderList.reduce((total, i) => total + i.netRate, 0);

          this.lStorageService.setitemonLocalStorage('cartData', cartData);
          const totalItems = cartData.HOME_DELIVERY.items.length + cartData.STORE_PICKUP.items.length;
          this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: totalItems });
          this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });

          this.toastService.showSuccess("Item added to cart");
          this.setAnalytics('addToCart');
          this.loggedIn = true;
          this.finishAddToCartLoading(preservedScrollY);
        } else {
          this.loggedIn = false;
          this.finishAddToCartLoading(preservedScrollY);
          this.isLogin = true;
        }
      }
    }
    )
  }

  capitalizeFirst(str) {
    return str
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  byNow() {
    this.action = "checkout";
    this.setAnalytics('checkOut');
    this.addToCart(this.action);
  }
  setAnalytics(source?) {
    let analytics = {
      accId: this.accountProfile.id,
      domId: this.accountProfile.serviceSector.id,
      subDomId: this.accountProfile.serviceSubSector.id,
      metricId: 548,
      storeId: this.lStorageService.getitemfromLocalStorage('storeId')
    }
    if (source == 'addToCart') {
      analytics['metricId'] = 550
    } else if (source == 'checkOut') {
      analytics['metricId'] = 553
    }
    this.consumerService.updateAnalytics(analytics).subscribe();
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // createCart() {
  //   console.log('this.itemDeliveryType',this.itemDeliveryType)
  //   let cartInfo: any = {
  //     store: {
  //       encId: this.storeEncId
  //     },
  //     providerConsumer: {
  //       id: this.loggedUser.providerConsumer
  //     }
  //   };
  //   let item = this.item
  //   if (this.virtualItem == true) {
  //     item = this.itemAttributes;
  //   } else {
  //     item = this.item;
  //   }
  //   const savedCartData = this.lStorageService.getitemfromLocalStorage('cartData');
  //   const savedDeliveryType = this.lStorageService.getitemfromLocalStorage('deliveryType');
  //   const calculatedDeliveryType = this.itemDeliveryType

  //   if (savedCartData && savedDeliveryType === calculatedDeliveryType) {
  //     this.tempOrderList = savedCartData.items;
  //     let itemExists = false;
  //     this.tempOrderList = this.tempOrderList.map((cartItem) => {
  //       if (cartItem.encId === item.encId) {
  //         itemExists = true;
  //         return {
  //           ...cartItem,  
  //           quantity: cartItem.quantity + this.quantity
  //         };
  //       }
  //       return cartItem;
  //     });
  //     if (!itemExists) {
  //       this.tempOrderList.push({
  //         encId: item.encId,
  //         quantity: this.quantity
  //       });
  //     }
  //     cartInfo.deliveryType = savedDeliveryType;
  //     cartInfo.items = this.tempOrderList.map((item) => ({
  //       catalogItem: { encId: item.encId },
  //       quantity: item.quantity,
  //       deliveryType:this.itemDeliveryType
  //     }));
  //   } else {
  //     cartInfo.deliveryType = calculatedDeliveryType;
  //     cartInfo.items = [
  //       {
  //         catalogItem: { encId: item.encId },
  //         quantity: this.quantity
  //       }
  //     ];
  //   }
  //   cartInfo['orderCategory'] = 'SALES_ORDER';
  //   cartInfo['orderSource'] = 'PROVIDER_CONSUMER';
  //   return new Promise((resolve, reject) => {
  //     this.orderService.createCart(cartInfo).subscribe((data: any) => {
  //       resolve(data);
  //     }, (error: any) => {
  //       resolve(false);
  //       let errorObj = this.errorService.getApiError(error);
  //       this.toastService.showError(errorObj);
  //     }
  //     );
  //   });
  // }
  //   createCart() {
  //   console.log('this.itemDeliveryType', this.itemDeliveryType);

  //   let item = this.virtualItem ? this.itemAttributes : this.item;
  //   const deliveryType = this.itemDeliveryType;
  //   const quantity = this.quantity;

  //   // Get existing cart data or initialize structure
  //   const savedCartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
  //     HOME_DELIVERY: { items: [] },
  //     STORE_PICKUP: { items: [] }
  //   };

  //   // Ensure current deliveryType exists in savedCartData
  //   if (!savedCartData[deliveryType]) {
  //     savedCartData[deliveryType] = { items: [] };
  //   }

  //   // Check if item exists and update quantity
  //   let itemExists = false;
  //   savedCartData[deliveryType].items = savedCartData[deliveryType].items.map(cartItem => {
  //     if (cartItem.encId === item.encId) {
  //       itemExists = true;
  //       return {
  //         ...cartItem,
  //         quantity: cartItem.quantity + quantity
  //       };
  //     }
  //     return cartItem;
  //   });

  //   // If item is new, push it
  //   if (!itemExists) {
  //     savedCartData[deliveryType].items.push({
  //       encId: item.encId,
  //       quantity: quantity
  //     });
  //   }

  //   // Store back the updated cart
  //   // this.lStorageService.setitemInLocalStorage('cartData', savedCartData);

  //   // Build cart request array
  //   const cartRequest = Object.keys(savedCartData).map((type) => {
  //     const items = savedCartData[type].items;

  //     // If no items, skip this cart
  //     if (!items || items.length === 0) return null;

  //     return {
  //       store: {
  //         encId: this.storeEncId
  //       },
  //       providerConsumer: {
  //         id: this.loggedUser.providerConsumer
  //       },
  //       deliveryType: type,
  //       items: items.map((i: any) => ({
  //         catalogItem: { encId: i.encId },
  //         quantity: i.quantity
  //       })),
  //       orderCategory: 'SALES_ORDER',
  //       orderSource: 'PROVIDER_CONSUMER'
  //     };
  //   }).filter(Boolean); // Remove null entries

  //   return new Promise((resolve, reject) => {
  //     this.itemService.createCart(cartRequest).subscribe(
  //       (data: any) => {
  //         resolve(data);
  //       },
  //       (error: any) => {
  //         resolve(false);
  //         const errorObj = this.errorService.getApiError(error);
  //         this.toastService.showError(errorObj);
  //       }
  //     );
  //   });
  // }
  createCart() {
    if (!this.resolveStoreContext()) {
      this.toastService.showError('Store information is unavailable. Please refresh and try again.');
      return Promise.resolve(false);
    }
    console.log('this.itemDeliveryType', this.itemDeliveryType);

    let item = this.virtualItem ? this.itemAttributes : this.item;
    const deliveryType = this.itemDeliveryType;
    const quantity = this.quantity;

    // Fetch or initialize savedCartData structure
    let savedCartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
      HOME_DELIVERY: { items: [] },
      STORE_PICKUP: { items: [] }
    };

    // Ensure current delivery type exists
    if (!savedCartData[deliveryType]) {
      savedCartData[deliveryType] = { items: [] };
    }

    // Update items for selected deliveryType
    let itemExists = false;
    savedCartData[deliveryType].items = savedCartData[deliveryType].items.map(cartItem => {
      if (cartItem.encId === item.encId) {
        itemExists = true;
        return {
          ...cartItem,
          quantity: cartItem.quantity + quantity
        };
      }
      return cartItem;
    });

    if (!itemExists) {
      savedCartData[deliveryType].items.push({
        encId: item.encId,
        quantity: quantity
      });
    }

    // Save updated cart data to localStorage
    // this.lStorageService.setitemInLocalStorage('cartData', savedCartData);

    // Build cart array with both delivery types if items exist
    const cartRequests = ['HOME_DELIVERY', 'STORE_PICKUP'].map((type) => {
      const items = savedCartData[type]?.items;
      if (!items || items.length === 0) return null;

      return {
        store: {
          encId: this.storeEncId
        },
        providerConsumer: {
          id: this.loggedUser.providerConsumer
        },
        deliveryType: type,
        items: items.map(i => ({
          catalogItem: { encId: i.encId },
          quantity: i.quantity
        })),
        orderCategory: 'SALES_ORDER',
        orderSource: 'PROVIDER_CONSUMER'
      };
    }).filter(Boolean); // Remove nulls

    // Create cart for each type and return a combined Promise
    const promises = cartRequests.map((cartInfo) => {
      return new Promise((resolve, reject) => {
        this.orderService.createCart(cartInfo).subscribe(
          (data: any) => resolve(data),
          (error: any) => {
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);
            resolve(false); // still resolve so Promise.all continues
          }
        );
      });
    });

    return Promise.all(promises);
  }

  viewItems(item: any) {
    this.router.navigate([this.sharedService.getRouteID(), 'item', item.encId]);
    setTimeout(() => {
      this.itemActionPerformed(item.encId);
    }, 100);
  }

  cartActionPerformed(input: any) {
    if (input.action == 'addToCart') {
      this.virtualItem = false;
      this.itemDeliveryType = input?.itemDeliveryType;
      this.itemActionPerformed(input.value.encId);
      setTimeout(() => {
        this.addToCart(null);
      }, 200);
    } else {
      this.viewItems(input.value);
    }
  }

  toggleContent() {
    this.showFullContent = !this.showFullContent;
  }

  getTruncatedContent(htmlContent): string {
    const maxLength = 400;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    let length = 0;
    const result: string[] = [];
    const traverseNodes = (node: Node) => {
      if (length >= maxLength) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node as Text).nodeValue || '';
        if (length + text.length > maxLength) {
          result.push(text.substring(0, maxLength - length) + '...');
          length = maxLength;
        } else {
          result.push(text);
          length += text.length;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const clonedElement = element.cloneNode(false) as HTMLElement;
        result.push(clonedElement.outerHTML);
        traverseChildNodes(element.childNodes, clonedElement);
      }
    };

    const traverseChildNodes = (childNodes: NodeList, parent: HTMLElement) => {
      for (let i = 0; i < childNodes.length; i++) {
        if (length >= maxLength) return;
        traverseNodes(childNodes[i]);
      }
    };

    traverseNodes(tempDiv);
    return result.join('');
  }

  actionClicked(action) {
    if (action.link && action.link.startsWith('http')) {
      window.open(action.link, "_system");
    } else {

    }
  }

  // for virtual-item

  initializeSelectedValues() {
    if (this.item && this.item.itemAttributes && Array.isArray(this.item.itemAttributes)) {
      this.item.itemAttributes.forEach(attribute => {
        if (attribute.values && attribute.values.length > 0) {
          this.virtualItem = true;
          this.selectedValues[attribute.attribute] = attribute.values[0]; // Select first value
          this.getAttributeItems(this.item);
        }
      });
    }
  }
  selectValue(attribute: string, value: any) {
    this.selectedValues[attribute] = value;
    this.getAttributeItems(this.item)
    this.quantity = 1;
  }

  getAttributeItems(itemData) {
    if (!itemData || !itemData.spItem || !itemData.spItem.spCode) {
      console.error('Invalid itemData for getAttributeItems');
      return;
    }
    let spItemCode = itemData.spItem.spCode;
    let sub1 = this.itemService.getAttributeItemsById(spItemCode, this.selectedValues).subscribe((itemData: any) => {
      if (itemData && Array.isArray(itemData)) {
        const validItems = itemData.filter(item => item.stockStatus !== 'OUT_OF_STOCK');
        const pricedItems = itemData.filter(item => (item.price || 0) > 0);
        const preferredItem =
          (validItems.length ? validItems[0] : null) ||
          (pricedItems.length ? pricedItems[0] : null) ||
          itemData[0];
        if (preferredItem) {
          this.virtualItem = true;
          this.itemAttributes = preferredItem;
          this.virtualItemOutOfStock = preferredItem.stockStatus === 'OUT_OF_STOCK';
          this.setVirtualItemDetails(this.itemAttributes);
        } else {
          console.warn('No items found for selected attributes');
          // Keep the original item if no attributes found
          this.virtualItem = false;
          this.virtualItemOutOfStock = false;
          this.updateThumbnailAttachments();
        }
      }
    }, (error: any) => {
      console.error('Error fetching attribute items:', error);
      this.virtualItem = false;
      this.virtualItemOutOfStock = false;
      this.updateThumbnailAttachments();
      this.loading = false;
    });
    this.subscriptions.add(sub1);
  }
  setVirtualItemDetails(itemData) {
    if (!itemData) {
      console.warn('setVirtualItemDetails called with undefined itemData');
      this.loading = false;
      return;
    }
    
    if (itemData && itemData.homeDelivery && this.itemDeliveryType != 'STORE_PICKUP') {
      this.itemDeliveryType = 'HOME_DELIVERY'
    } else {
      this.itemDeliveryType = 'STORE_PICKUP'
    }
    if (itemData && itemData.spItemDto && itemData.spItemDto.id) {
      this.itemId = itemData.spItemDto.id;
    }
    if (itemData && itemData.spItem && itemData.spItem.encId) {
      this.itemEncId = itemData.spItem.encId;
    }
    if (itemData?.spItemDto?.itemCategory?.id) {
      this.spItemCategoryId = itemData.spItemDto.itemCategory.id;
    }
    // Only update image if virtual item has attachments, otherwise keep the original image
    if (itemData && itemData.spItemDto && itemData.spItemDto.attachments && itemData.spItemDto.attachments.length > 0) {
      this.selectedItemImage = itemData.spItemDto.attachments[0];
      this.updateVideoState(this.selectedItemImage);
      this.trackSelectedMediaLoad(this.selectedItemImage);
    } else if (!this.selectedItemImage || !this.selectedItemImage.s3path) {
      // Only set fallback if no image is currently set
      this.selectedItemImage = { s3path: (this.cdnPath + 'assets/images/rx-order/items/Items.svg') };
      this.updateVideoState(this.selectedItemImage);
      this.trackSelectedMediaLoad(this.selectedItemImage);
    }
    if (itemData && itemData.spItemDto && itemData.spItemDto.badges && itemData.spItemDto.badges.length > 0) {
      this.badges = itemData.spItemDto.badges;
    }
    this.updateThumbnailAttachments();
    this.loading = false;
    // Use virtual item description if available, otherwise fall back to main item
    const description =
      itemData?.spItemDto?.internalDesc ||
      itemData?.internalDesc ||
      this.item?.spItemDto?.internalDesc ||
      this.item?.internalDesc ||
      '';
    if (description) {
      this.setHtmlContent(description);
    }
    const shortDesc =
      itemData?.spItemDto?.shortDesc ||
      itemData?.spItem?.description ||
      this.item?.spItemDto?.shortDesc ||
      this.item?.spItem?.description ||
      '';
    if (shortDesc) {
      this.setShortDesc(shortDesc);
    } else {
      this.shortDescHtml = null;
    }
  }

  private updateThumbnailAttachments(): void {
    const virtualAttachments = this.itemAttributes?.spItemDto?.attachments;
    if (this.virtualItem && Array.isArray(virtualAttachments) && virtualAttachments.length) {
      this.thumbnailAttachments = virtualAttachments;
      return;
    }
    const mainAttachments = this.item?.spItemDto?.attachments;
    if (Array.isArray(mainAttachments) && mainAttachments.length) {
      this.thumbnailAttachments = mainAttachments;
      return;
    }
    this.thumbnailAttachments = [];
  }

  isVideoAttachment(attachment: any): boolean {
    if (!attachment || !attachment.s3path) {
      return false;
    }
    if (attachment.fileType && attachment.fileType.toLowerCase() === 'mp4') {
      return true;
    }
    if (attachment.fileName && /\.(mp4|webm|ogg)$/i.test(attachment.fileName)) {
      return true;
    }
    if (attachment.type === 'video') {
      return true;
    }
    return /\.(mp4|webm|ogg)$/i.test(attachment.s3path);
  }

  onVideoReady(): void {
    if (this.isVideoAttachment(this.selectedItemImage)) {
      this.isVideoReady = true;
    }
    if (this.mediaLoading) {
      this.mediaLoading = false;
    }
  }

  onVideoWaiting(): void {
    // Keep current media visible; don't flip back to image on brief buffering.
  }

  getVideoPoster(attachment: any): string {
    const candidate = attachment?.poster || attachment?.thumbnail || attachment?.thumb || attachment?.preview;
    if (candidate) {
      return candidate;
    }
    const fallback =
      this.thumbnailAttachments?.find(a => !this.isVideoAttachment(a))?.s3path
      || this.item?.spItemDto?.attachments?.find(a => !this.isVideoAttachment(a))?.s3path
      || this.itemAttributes?.spItemDto?.attachments?.find(a => !this.isVideoAttachment(a))?.s3path
      || (this.cdnPath + 'assets/images/rx-order/items/Items.svg');
    return fallback;
  }

  getPreviewImageSrc(attachment: any): string {
    if (!attachment) {
      return this.cdnPath + 'assets/images/rx-order/items/Items.svg';
    }
    if (this.isVideoAttachment(attachment)) {
      return this.getVideoPoster(attachment);
    }
    return attachment.s3path || (this.cdnPath + 'assets/images/rx-order/items/Items.svg');
  }

  private trackSelectedMediaLoad(attachment: any): void {
    this.mediaLoadToken += 1;
    const token = this.mediaLoadToken;
    if (!attachment) {
      this.mediaLoading = false;
      return;
    }
    if (this.isVideoAttachment(attachment)) {
      this.mediaLoading = true;
      return;
    }
    const src = this.getPreviewImageSrc(attachment);
    if (!src) {
      this.mediaLoading = false;
      return;
    }
    this.mediaLoading = true;
    const img = new Image();
    img.onload = () => {
      if (this.mediaLoadToken === token) {
        this.mediaLoading = false;
      }
    };
    img.onerror = () => {
      if (this.mediaLoadToken === token) {
        this.mediaLoading = false;
      }
    };
    img.src = src;
  }

  private updateVideoState(item: any): void {
    const isVideo = this.isVideoAttachment(item);
    this.isVideoReady = !isVideo;
    if (!isVideo) {
      this.isVideoMuted = true;
    }
  }

  toggleVideoMute(): void {
    this.isVideoMuted = !this.isVideoMuted;
  }

  openShareSheet(): void {
    this.isShareSheetOpen = true;
  }

  closeShareSheet(): void {
    this.isShareSheetOpen = false;
  }

  getShareItemName(): string {
    return !this.virtualItem
      ? (this.item?.parentItemName || this.item?.spItemDto?.name || 'Product')
      : (this.itemAttributes?.parentItemName || this.itemAttributes?.spItemDto?.name || 'Product');
  }

  getShareItemSubtitle(): string {
        const itemName = this.getShareItemName();
    const desc = !this.virtualItem
      ? (this.item?.spItemDto?.shortDesc || this.item?.spItem?.description || '')
      : (this.itemAttributes?.spItemDto?.shortDesc || this.itemAttributes?.spItem?.description || '');
    return desc || `Take a look at this ${itemName} on ${this.sharedService.getRouteID()}`;
  }

  private getShareItemUrl(): string {
    const itemId = this.item?.encId || this.itemEncid;
    return itemId
      ? `${window.location.origin}/${this.sharedService.getRouteID()}/item/${itemId}`
      : window.location.href;
  }

  private getShareText(): string {
    const itemName = this.getShareItemName();
    const itemUrl = this.getShareItemUrl();
    return `Take a look at this ${itemName} on ${this.sharedService.getRouteID()} ${itemUrl}`;
  }

  private copyShareText(): void {
    const text = this.getShareItemUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.toastService.showSuccess('Link copied');
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.toastService.showSuccess('Link copied');
    } catch {
      this.toastService.showError('Unable to copy link');
    } finally {
      document.body.removeChild(textarea);
    }
  }

  private openShareUrl(url: string): void {
    window.open(url, '_blank');
  }

  shareVia(type: string): void {
    const text = this.getShareText();
    const url = this.getShareItemUrl();
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    this.closeShareSheet();
    switch (type) {
      case 'copy':
        this.copyShareText();
        break;
      case 'whatsapp':
        this.openShareUrl(`https://wa.me/?text=${encodedText}`);
        break;
      case 'facebook':
        this.openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`);
        break;
      case 'messenger':
        this.openShareUrl(`fb-messenger://share/?link=${encodedUrl}&app_id=0`);
        break;
      case 'gmail':
        this.openShareUrl(`https://mail.google.com/mail/?view=cm&to=&su=${encodeURIComponent('Check this out')}&body=${encodedText}`);
        break;
      case 'sms':
        this.openShareUrl(`sms:?&body=${encodedText}`);
        break;
      case 'linkedin':
        this.openShareUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
        break;
      case 'more':
        if (navigator.share) {
          navigator.share({ text, url })
          // .catch(() => {
          //   this.copyShareText();
          // });
        } 
        // else {
        //   this.copyShareText();
        // }
        break;
      default:
        this.copyShareText();
        break;
    }
  }

  orderDeliveryType(type?) {
    if (type == 'homeDelivery') {
      this.itemDeliveryType = 'HOME_DELIVERY'
    }
    else {
      this.itemDeliveryType = 'STORE_PICKUP'
    }

  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    this.showDeliveryAvailability = false;
    this.showDeliveryUnAvailability = false;
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  limitLength() {
    if (this.pinCode && this.pinCode.length > 8) {
      this.pinCode = this.pinCode.substring(0, 8);
    }
  }

  checkAvailability() {
    let filter: any = {};
    this.deliveryAvailability = '';
    filter['account'] = this.accountId;
    filter['storeEncId-eq'] = this.storeEncId;
    filter['pincode-eq'] = this.pinCode;
    this.itemService.checkAvailabilityByPincode(this.itemEncId, filter).subscribe((data: any) => {
      this.pinCodeResponse = data;
      this.showDeliveryAvailability = true;
      this.deliveryAvailability = 'Your order will be delivered within ' + this.pinCodeResponse.minDays + ' to ' + this.pinCodeResponse.maxDays + ' days.';
    },
      () => {
        this.showDeliveryUnAvailability = true;
        this.deliveryAvailability = 'Invalid pincode, request failed.';
      });
  }

  getShipmentSettings() {
    this.itemService.getJsonsbyTypes(this.accountProfile.uniqueId).subscribe((data: any) => {
      this.shipmentData = data;
      if (this.shipmentData?.shipmentSettings?.enableshipment && this.shipmentData?.shipmentSettings?.shipmentProvider == 'SHIPROCKET') {
        this.showCheckDeliveryAvailability = true;
      }
    });
  }

  sendEnquiry(): void {
    const phoneRaw = this.accountProfile?.phoneNumbers?.[0]?.instance || this.accountProfile?.accountLinkedPhNo || '';
    const phone = phoneRaw.replace(/[^0-9]/g, '');
    if (!phone) {
      this.toastService.showError('Provider WhatsApp number not available');
      return;
    }
    const itemName = !this.virtualItem
      ? (this.item?.parentItemName || this.item?.spItemDto?.name || 'Product')
      : (this.itemAttributes?.parentItemName || this.itemAttributes?.spItemDto?.name || 'Product');
    const price = !this.hidePrices
      ? (this.virtualItem ? this.itemAttributes?.price : this.item?.price)
      : null;
    const itemId = this.item?.encId || this.itemEncid;
    const itemUrl = itemId
      ? `${window.location.origin}/${this.sharedService.getRouteID()}/item/${itemId}`
      : window.location.href;
    // const messageParts = [
    //   "Hi! I just saw this on your store and I'm interested:",
    //   "",
    //  `Product: ${itemName}`,
    //   "",
    //  price ? `Price: Rs. ${price}` : null,
    //   "",
    //   "Is this still available? I'd love to get more details.",
    //   "",
    //   `Product Link: ${itemUrl}`
    // ].filter(p => p !== null);
    // const emojiPackage = "\u{1F4E6}";
    // const emojiMoney = "\u{1F4B0}";

    const intro = "Hi! I just saw this on your store and I'm interested:";
    const item = `Item: ${itemName}`;
    const priceStr = price ? `Price: Rs. ${price}` : '';
    const ask = "Is this still available? I'd love to get more details.";
    const link = `Product Link: ${itemUrl}`;

    const message = encodeURIComponent(intro) + "%0A" + 
                    encodeURIComponent(item) + "%0A" + 
                    (priceStr ? encodeURIComponent(priceStr) + "%0A" : "") + 
                    encodeURIComponent(ask) + "%0A" + 
                    encodeURIComponent(link);
    // const message = encodeURIComponent(messageParts.join(' '));
    const whatsappUrl = `https://wa.me/+91${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  getItemTags(): any[] {
    const tagSources = [
      this.item?.itemTags,
      this.item?.spItemDto?.itemTags,
      this.itemAttributes?.itemTags,
      this.itemAttributes?.spItemDto?.itemTags
    ];
    for (const source of tagSources) {
      if (Array.isArray(source) && source.length) {
        return source;
      }
    }
    return [];
  }

  getTagLabel(tag: any): string {
    if (!tag) {
      return '';
    }
    return tag.tagName || tag.name || tag.label || '';
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ServiceMeta } from 'jconsumer-shared';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly itemsMap = new Map<string, any>();
  private readonly wishlistUidByItemEncId = new Map<string, string>();
  private readonly spCodeByItemEncId = new Map<string, string>();
  private readonly idsSubject = new BehaviorSubject<Set<string>>(new Set());

  readonly changes$ = this.idsSubject.asObservable();

  constructor(private serviceMeta: ServiceMeta) {}

  addToWishlist(payload: any) {
    const url = 'consumer/wishlist';
    return this.serviceMeta.httpPost(url, payload);
  }

  getWishlistItemswithFilter(filter: any) {
    const url = 'consumer/wishlist/item';
    return this.serviceMeta.httpGet(url, null, filter);
  }
  getallWishlistItems(providerConsumerId: any) {
    const url = `consumer/wishlist/procon/${providerConsumerId}`;
    return this.serviceMeta.httpGet(url, null);
  }


  getWishlistItemsCount(filter: any) {
    const url = 'consumer/wishlist/item/count';
    return this.serviceMeta.httpGet(url, null, filter);
  }

  deleteWishlistItemBySpCode(spCode: string) {
    const url = `consumer/wishlist/item/${spCode}`;
    return this.serviceMeta.httpDelete(url, null);
  }

  deleteWishlistItemByItemEncId(itemEncId: string, providerConsumerId?: any) {
    if (!itemEncId) {
      return throwError(() => new Error('Missing wishlist item id'));
    }
    const knownSpCode = this.getWishlistItemSpCode(itemEncId);
    if (knownSpCode) {
      return this.deleteWishlistItemBySpCode(knownSpCode);
    }
    if (!providerConsumerId) {
      return throwError(() => new Error('Missing provider consumer id'));
    }
    const filter = { 'providerConsumerId-eq': providerConsumerId };
    return this.getWishlistItemswithFilter(filter).pipe(
      switchMap((wishlistItems: any) => {
        const list = Array.isArray(wishlistItems)
          ? wishlistItems
          : Array.isArray(wishlistItems?.items)
            ? wishlistItems.items
            : [];
        const match = list.find((wish) => wish?.catalogItem?.encId === itemEncId);
        const resolvedSpCode = match?.spItem?.spCode;
        if (!resolvedSpCode) {
          return throwError(() => new Error('Wishlist item spCode not found'));
        }
        this.setWishlistItemSpCode(itemEncId, resolvedSpCode);
        return this.deleteWishlistItemBySpCode(resolvedSpCode);
      })
    );
  }
  
  removeFromWishlist(id: string): void {
    if (!id) {
      return;
    }
    if (this.itemsMap.delete(id)) {
      this.wishlistUidByItemEncId.delete(id);
      this.spCodeByItemEncId.delete(id);
      this.emitIds();
    }
  }

  isWishlisted(id?: string): boolean {
    if (!id) {
      return false;
    }
    return this.itemsMap.has(id);
  }

  toggle(item: any): boolean {
    const id = item?.encId;
    if (!id) {
      return false;
    }
    if (this.itemsMap.has(id)) {
      this.itemsMap.delete(id);
      this.emitIds();
      return false;
    }
    this.itemsMap.set(id, item);
    this.emitIds();
    return true;
  }

  add(item: any): void {
    const id = item?.encId;
    if (!id) {
      return;
    }
    this.itemsMap.set(id, item);
    const spCode = item?.spItem?.spCode || item?.spItemDto?.spCode || item?.spCode;
    if (spCode) {
      this.spCodeByItemEncId.set(id, spCode);
    }
    this.emitIds();
  }

  setWishlistItemUid(itemEncId: string, wishlistUid: string): void {
    if (!itemEncId || !wishlistUid) {
      return;
    }
    this.wishlistUidByItemEncId.set(itemEncId, wishlistUid);
  }

  getWishlistItemUid(itemEncId: string): string | undefined {
    if (!itemEncId) {
      return undefined;
    }
    return this.wishlistUidByItemEncId.get(itemEncId);
  }

  setWishlistItemSpCode(itemEncId: string, spCode: string): void {
    if (!itemEncId || !spCode) {
      return;
    }
    this.spCodeByItemEncId.set(itemEncId, spCode);
  }

  getWishlistItemSpCode(itemEncId: string): string | undefined {
    if (!itemEncId) {
      return undefined;
    }
    return this.spCodeByItemEncId.get(itemEncId);
  }


  getItems(): any[] {
    return Array.from(this.itemsMap.values());
  }

  getIds(): string[] {
    return Array.from(this.itemsMap.keys());
  }

  clear(): void {
    this.itemsMap.clear();
    this.wishlistUidByItemEncId.clear();
    this.spCodeByItemEncId.clear();
    this.emitIds();
  }

  private emitIds(): void {
    this.idsSubject.next(new Set(this.itemsMap.keys()));
  }
}

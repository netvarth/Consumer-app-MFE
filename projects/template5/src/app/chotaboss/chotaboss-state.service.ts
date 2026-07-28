import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { chotaBossAssetUrl } from './chotaboss-assets';

export interface City { id: string; name: string; icon: string; }
export interface Provider { id: string; name: string; distance: string; address: string; rating: number; timing: string; banner: string; logo: string; }
export interface ServiceItem { id: string; name: string; description: string; price: number; image: string; }
export interface Product { id: string; name: string; category: string; variant: string; price: number; originalPrice?: number; discount?: number; image: string; }
export interface CartLine { product: Product; quantity: number; }
export interface Booking { id: string; date: string; time: string; provider: Provider; service: ServiceItem; petType: 'Dog' | 'Cat'; }
export interface OrderSummary { id: string; etaMinutes: number; address: string; subtotal: number; deliveryFee: number; discount: number; total: number; }

@Injectable({ providedIn: 'root' })
export class ChotaBossStateService {
  readonly cities: City[] = [
    { id: 'near', name: 'Near You', icon: '➤' }, { id: 'thrissur', name: 'Thrissur', icon: '🏛️' },
    { id: 'bengaluru', name: 'Bengaluru', icon: '🏰' }, { id: 'chennai', name: 'Chennai', icon: '🛕' }
  ];
  readonly providers: Provider[] = [
    { id: 'for-our-pets', name: 'For Our Pets - Pet Grooming Studio & Academy Thrissur', distance: '2.3 KM', address: 'Thrissur, Kerala', rating: 4.9, timing: '09:30 AM - 06:00 PM', banner: chotaBossAssetUrl('provider-for-our-pets.jpg'), logo: chotaBossAssetUrl('provider-for-our-pets.jpg') },
    { id: 'pet-focuz', name: 'Pet Focuz Thrissur', distance: '2.3 KM', address: 'Valarkkavu, Nehru Nagar, Kuriachira, Thrissur', rating: 4.9, timing: '09:30 AM - 06:00 PM', banner: chotaBossAssetUrl('provider-pet-focuz.jpg'), logo: chotaBossAssetUrl('pet-focuz-logo.png') }
  ];
  readonly services: ServiceItem[] = [
    { id: 'spa-bath', name: 'Spa Bath', description: 'Complete drying and brushing FREE vet consultation with each bath', price: 1099, image: chotaBossAssetUrl('spa-bath.jpg') },
    { id: 'spa-haircut', name: 'Spa Bath & Hair Cut', description: 'Bath with vet-approved products for your pets Full-body hair cut', price: 1099, image: chotaBossAssetUrl('spa-haircut.jpg') }
  ];
  readonly products: Product[] = [
    { id: 'merrick', name: 'Merrick Purrfect Bistro Grain-Free Real Chicken', category: 'Chicken', variant: '1.5kg', price: 185, originalPrice: 210, discount: 15, image: chotaBossAssetUrl('merrick-product.jpg') },
    { id: 'recovery', name: 'Recovery food for adult dogs - High energy', category: 'Wet Food', variant: '400g', price: 35, originalPrice: 118, discount: 10, image: chotaBossAssetUrl('recovery-product.jpg') },
    { id: 'royal', name: 'Royal Canin Dental Care For Cats', category: 'Dental Treats', variant: '1.5kg', price: 120, image: chotaBossAssetUrl('royal-canin-product.jpg') }
  ];
  private readonly prefix = 'chotaboss-template5-';
  private readonly bookingSubject = new BehaviorSubject<Booking | null>(this.read<Booking>('booking'));
  private readonly cartSubject = new BehaviorSubject<CartLine[]>(this.read<CartLine[]>('cart') ?? []);
  private readonly orderSubject = new BehaviorSubject<OrderSummary | null>(this.read<OrderSummary>('order'));
  readonly booking$ = this.bookingSubject.asObservable(); readonly cart$ = this.cartSubject.asObservable(); readonly order$ = this.orderSubject.asObservable();
  selectedCity = this.read<string>('city') ?? 'near'; selectedProvider = this.providers[1]; selectedService = this.services[0];
  note = this.read<string>('note') ?? ''; couponApplied = this.read<boolean>('coupon') ?? true; paymentInProgress = false;
  get booking(): Booking | null { return this.bookingSubject.value; } get cart(): CartLine[] { return this.cartSubject.value; } get order(): OrderSummary | null { return this.orderSubject.value; }
  selectCity(id: string): void { this.selectedCity = id; this.write('city', id); }
  selectProvider(provider: Provider): void { this.selectedProvider = provider; } selectService(service: ServiceItem): void { this.selectedService = service; }
  createBooking(petType: 'Dog' | 'Cat', date: string, time: string): Booking {
    const booking = { id: `CB-${Date.now().toString().slice(-7)}`, date, time, provider: this.selectedProvider, service: this.selectedService, petType };
    this.bookingSubject.next(booking); this.write('booking', booking); return booking;
  }
  quantity(id: string): number { return this.cart.find((line) => line.product.id === id)?.quantity ?? 0; }
  changeQuantity(product: Product, delta: number): void {
    const current = this.quantity(product.id); const quantity = Math.max(0, Math.min(9, current + delta));
    const next = this.cart.filter((line) => line.product.id !== product.id); if (quantity) next.push({ product, quantity });
    this.cartSubject.next(next); this.write('cart', next);
  }
  get itemCount(): number { return this.cart.reduce((sum, line) => sum + line.quantity, 0); }
  get subtotal(): number { return this.cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0); }
  get deliveryFee(): number { return this.cart.length ? 25 : 0; } get discount(): number { return this.couponApplied && this.cart.length ? Math.min(25, this.subtotal) : 0; }
  get total(): number { return Math.max(0, this.subtotal + this.deliveryFee - this.discount); }
  setNote(note: string): void { this.note = note.trim(); this.write('note', this.note); }
  toggleCoupon(): void { this.couponApplied = !this.couponApplied; this.write('coupon', this.couponApplied); }
  async placeOrder(): Promise<OrderSummary> {
    if (this.paymentInProgress) throw new Error('Payment is already processing'); if (!this.cart.length) throw new Error('Your cart is empty');
    this.paymentInProgress = true; await new Promise((resolve) => setTimeout(resolve, 500));
    const order = { id: `ORD-${Math.floor(10000 + Math.random() * 89999)}`, etaMinutes: 34, address: 'CB904 Salarpuri Greenage, Bengaluru', subtotal: this.subtotal, deliveryFee: this.deliveryFee, discount: this.discount, total: this.total };
    this.orderSubject.next(order); this.write('order', order); this.paymentInProgress = false; return order;
  }
  private read<T>(key: string): T | null { try { const value = localStorage.getItem(this.prefix + key); return value ? JSON.parse(value) as T : null; } catch { return null; } }
  private write<T>(key: string, value: T): void { try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); } catch { /* optional storage */ } }
}

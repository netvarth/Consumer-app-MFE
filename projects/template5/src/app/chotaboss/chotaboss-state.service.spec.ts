import { ChotaBossStateService } from './chotaboss-state.service';

describe('ChotaBossStateService', () => {
  let service: ChotaBossStateService;

  beforeEach(() => {
    localStorage.clear();
    service = new ChotaBossStateService();
  });

  it('calculates cart count, subtotal, discount, delivery fee and total in integer units', () => {
    service.changeQuantity(service.products[0], 1);
    service.changeQuantity(service.products[1], 1);
    expect(service.itemCount).toBe(2);
    expect(service.subtotal).toBe(220);
    expect(service.deliveryFee).toBe(25);
    expect(service.discount).toBe(25);
    expect(service.total).toBe(220);
  });

  it('bounds quantities between zero and nine', () => {
    for (let index = 0; index < 12; index += 1) service.changeQuantity(service.products[0], 1);
    expect(service.quantity(service.products[0].id)).toBe(9);
    for (let index = 0; index < 12; index += 1) service.changeQuantity(service.products[0], -1);
    expect(service.quantity(service.products[0].id)).toBe(0);
    expect(service.cart.length).toBe(0);
  });

  it('creates and persists a booking from the selected provider and service', () => {
    service.selectProvider(service.providers[1]);
    service.selectService(service.services[0]);
    const booking = service.createBooking('Dog', '17 June 2026', '12:00 PM');
    expect(booking.provider.id).toBe('pet-focuz');
    expect(booking.service.id).toBe('spa-bath');
    expect(service.booking?.time).toBe('12:00 PM');
  });

  it('prevents duplicate order submission while payment is in progress', async () => {
    service.changeQuantity(service.products[0], 1);
    const first = service.placeOrder();
    await expectAsync(service.placeOrder()).toBeRejectedWithError('Payment is already processing');
    await expectAsync(first).toBeResolved();
  });

  it('does not place an order for an empty cart', async () => {
    await expectAsync(service.placeOrder()).toBeRejectedWithError('Your cart is empty');
  });
});

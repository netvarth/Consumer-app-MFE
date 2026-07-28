import { PetStoreComponent } from './pet-store.component';
import { StoreHeaderComponent } from './store-header.component';

describe('PetStoreComponent', () => {
  function createComponent(template: any): PetStoreComponent {
    const sharedService = {
      getTemplateJSON: () => template,
      getRouteID: () => 'chotaboss'
    };
    const accountService = { getStores: () => [] };
    const localStorageService = { setitemonLocalStorage: jasmine.createSpy('setitemonLocalStorage') };
    const router = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
      navigateByUrl: jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true))
    };
    return new PetStoreComponent(sharedService as any, accountService as any, localStorageService as any, router as any);
  }

  it('renders page content from the petStore JSON configuration', () => {
    const component = createComponent({
      logo: '/logo.png',
      petStore: {
        assetBasePath: '/pet-store/',
        title: 'Configured Store',
        subtitle: 'Configured subtitle',
        categories: [{ name: 'Treats', image: 'treats.png' }],
        brands: [{ name: 'Acme', image: 'acme.png' }],
        shops: [{ name: 'Pet Hub', image: 'hub.png' }],
        promotion: { title: 'Offer', image: 'offer.png' },
        navigation: []
      }
    });

    component.ngOnInit();

    expect(component.title).toBe('Configured Store');
    expect(component.subtitle).toBe('Configured subtitle');
    expect(component.categories[0].name).toBe('Treats');
    expect(component.categories[0].image).toBe('/pet-store/treats.png');
    expect(component.brands[0].name).toBe('Acme');
    expect(component.shops[0].name).toBe('Pet Hub');
    expect(component.promotion.title).toBe('Offer');
    expect(component.headerConfig.logo).toBe('/logo.png');
  });

  it('uses safe fallback content when optional arrays are missing', () => {
    const component = createComponent({ petStore: { assetBasePath: '/pet-store/' } });

    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.categories.length).toBe(3);
    expect(component.brands.length).toBe(4);
    expect(component.shops.length).toBe(2);
  });
});

describe('StoreHeaderComponent', () => {
  it('emits search text as it changes', () => {
    const component = new StoreHeaderComponent();
    const emitted: string[] = [];
    component.searchQueryChange.subscribe(value => emitted.push(value));

    component.updateSearch('skin medicine');

    expect(component.searchQuery).toBe('skin medicine');
    expect(emitted).toEqual(['skin medicine']);
  });
});
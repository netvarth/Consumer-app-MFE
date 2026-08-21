import { PetStoreComponent } from './pet-store.component';

describe('PetStoreComponent', () => {
  function createComponent(petStorePage: any): { component: PetStoreComponent; router: any } {
    const sharedService = {
      getTemplateJSON: () => ({ petStorePage }),
      getRouteID: () => 'chotaboss'
    };
    const router = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
    };
    const component = new PetStoreComponent(sharedService as any, router as any, document);
    return { component, router };
  }

  it('sorts enabled actions and content by sortOrder', () => {
    const { component } = createComponent({
      enabled: true,
      hero: {
        actions: [
          { key: 'profile', label: 'Profile', icon: 'profile.svg', enabled: true, sortOrder: 2 },
          { key: 'disabled', label: 'Disabled', icon: 'disabled.svg', enabled: false, sortOrder: 0 },
          { key: 'cart', label: 'Cart', icon: 'cart.svg', enabled: true, sortOrder: 1 }
        ]
      },
      categories: {
        items: [
          { id: 'food', name: 'Food', enabled: true, sortOrder: 2 },
          { id: 'hidden', name: 'Hidden', enabled: false, sortOrder: 0 },
          { id: 'pharmacy', name: 'Pharmacy', enabled: true, sortOrder: 1 }
        ]
      }
    });

    component.ngOnInit();

    expect(component.actions.map(item => item.key)).toEqual(['cart', 'profile']);
    expect(component.categories.map(item => item.id)).toEqual(['pharmacy', 'food']);
    component.ngOnDestroy();
  });

  it('does not navigate for a blank search', () => {
    const { component, router } = createComponent({
      hero: { search: { searchRoute: 'pet-store/search', queryParameter: 'q' } }
    });
    component.ngOnInit();
    component.searchQuery = '   ';

    component.submitSearch();

    expect(router.navigate).not.toHaveBeenCalled();
    component.ngOnDestroy();
  });

  it('navigates search using the configured route and query parameter', () => {
    const { component, router } = createComponent({
      hero: { search: { searchRoute: 'pet-store/search', queryParameter: 'term' } }
    });
    component.ngOnInit();
    component.searchQuery = ' skin & coat ';

    component.submitSearch();

    expect(router.navigate).toHaveBeenCalledWith(
      ['chotaboss', 'pet-store', 'search'],
      { queryParams: { term: 'skin & coat' } }
    );
    component.ngOnDestroy();
  });

  it('handles missing optional arrays without fallback content or crashes', () => {
    const { component } = createComponent({ enabled: true });

    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.categories).toEqual([]);
    expect(component.brands).toEqual([]);
    expect(component.shops).toEqual([]);
    expect(component.offers).toEqual([]);
    component.ngOnDestroy();
  });

  it('redirects when the configured page is disabled', () => {
    const { component, router } = createComponent({ enabled: false });

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['chotaboss']);
  });
});

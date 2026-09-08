import { CommonModule, Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';
import { StoreCardComponent } from '../components/store-card/store-card.component';
import { ServiceMarketplaceConfig } from '../models/service-marketplace.models';
import { StoreSelectionComponent } from './store-selection.component';
import { CrossTenantJourneyService, DocumentNavigationService } from '@consumer/cross-tenant';

describe('StoreSelectionComponent', () => {
  let fixture: ComponentFixture<StoreSelectionComponent>;
  let component: StoreSelectionComponent;
  const router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
  const journey = jasmine.createSpyObj<CrossTenantJourneyService>('CrossTenantJourneyService', ['start']);
  const documentNavigation = jasmine.createSpyObj<DocumentNavigationService>('DocumentNavigationService', ['assign']);
  const config: ServiceMarketplaceConfig = {
    enabled: true,
    routes: { storeSelection: 'service-stores', serviceSelection: 'service-store/:storeId' },
    selection: { defaultLocationId: 'one', defaultActionKey: 'groom' },
    storeSelectionPage: { title: 'Choose', showLocationSelector: true, showActionFilters: true, distanceSuffix: 'km' },
    serviceSelectionPage: { timingsLabel: 'Hours' },
    locations: [{ id: 'one', name: 'Location One', enabled: true }, { id: 'two', name: 'Location Two', enabled: true }],
    actionCategories: [
      { key: 'groom', label: 'Grooming', enabled: true },
      { key: 'board', label: 'Boarding', enabled: true },
      { key: 'PetStore', label: 'Pet Store', enabled: true }
    ],
    stores: [
      { id: 'one', name: 'Store One', locationId: 'one', actionKeys: ['groom'], enabled: true, services: [] },
      { id: 'two', name: 'Store Two', locationId: 'two', actionKeys: ['board'], enabled: true, services: [] },
      { id: 'pet', name: 'Pet Store Provider', locationId: 'one', actionKeys: ['PetStore'], enabled: true, services: [] },
      { id: 'off', name: 'Disabled', locationId: 'one', actionKeys: ['groom'], enabled: false, services: [] }
    ]
  };

  beforeEach(async () => {
    localStorage.removeItem('appId');
    localStorage.removeItem('installId');
    router.navigate.calls.reset();
    router.navigateByUrl.calls.reset();
    journey.start.calls.reset();
    documentNavigation.assign.calls.reset();
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [StoreSelectionComponent, StoreCardComponent],
      providers: [
        { provide: SharedService, useValue: {
          getTemplateJSON: () => ({ serviceMarketplace: config }),
          getRouteID: () => 'chotaboss',
          getCustomID: () => 'chotaboss'
        } },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: Location, useValue: { back: jasmine.createSpy('back') } },
        { provide: CrossTenantJourneyService, useValue: journey },
        { provide: DocumentNavigationService, useValue: documentNavigation }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(StoreSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders JSON locations, actions, and only matching enabled stores', () => {
    expect(fixture.nativeElement.textContent).toContain('Location One');
    expect(fixture.nativeElement.textContent).toContain('Grooming');
    expect(fixture.nativeElement.textContent).toContain('Store One');
    expect(fixture.nativeElement.textContent).not.toContain('Disabled');
  });

  it('updates results when location and action change', () => {
    component.selectLocation(config.locations![1]);
    component.selectAction(config.actionCategories![1]);
    expect(component.stores.map((store) => store.id)).toEqual(['two']);
  });

  it('filters Pet Store through the shared marketplace action key', () => {
    component.selectAction(config.actionCategories![2]);
    expect(component.selectedActionKey).toBe('PetStore');
    expect(component.stores.map((store) => store.id)).toEqual(['pet']);
  });

  it('opens the configured store route', () => {
    component.openStore(config.stores![0]);
    expect(router.navigateByUrl).toHaveBeenCalledWith('chotaboss/service-store/one');
  });

  it('starts a cross-tenant journey and document-navigates for a valid providerlink', () => {
    localStorage.setItem('appId', JSON.stringify('56'));
    localStorage.setItem('installId', JSON.stringify('34'));
    const providerUrl = 'https://scale.jaldee.com/capp/sugarandspice';
    component.openStore({ ...config.stores![0], providerlink: providerUrl });
    expect(journey.start).toHaveBeenCalledWith('chotaboss', jasmine.any(String), providerUrl);
    expect(documentNavigation.assign).toHaveBeenCalledWith(providerUrl);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('appId')!)).toBe('56');
    expect(JSON.parse(localStorage.getItem('installId')!)).toBe('34');
  });

  it('leaves target installation parameters on the destination URL', () => {
    const providerUrl = 'https://scale.jaldee.com/capp/sugarandspice?inst_id=34&app_id=76';
    component.openStore({ ...config.stores![0], providerlink: providerUrl });
    expect(documentNavigation.assign).toHaveBeenCalledWith(providerUrl);
    expect(localStorage.getItem('appId')).toBeNull();
    expect(localStorage.getItem('installId')).toBeNull();
  });

  it('falls back to service selection when providerlink is missing or invalid', () => {
    component.openStore({ ...config.stores![0], providerlink: 'javascript:alert(1)' });
    expect(journey.start).not.toHaveBeenCalled();
    expect(documentNavigation.assign).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('chotaboss/service-store/one');
  });
});

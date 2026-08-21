import { CommonModule, Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';
import { StoreCardComponent } from '../components/store-card/store-card.component';
import { ServiceMarketplaceConfig } from '../models/service-marketplace.models';
import { StoreSelectionComponent } from './store-selection.component';

describe('StoreSelectionComponent', () => {
  let fixture: ComponentFixture<StoreSelectionComponent>;
  let component: StoreSelectionComponent;
  const router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
  const config: ServiceMarketplaceConfig = {
    enabled: true,
    routes: { storeSelection: 'service-stores', serviceSelection: 'service-store/:storeId' },
    selection: { defaultLocationId: 'one', defaultActionKey: 'groom' },
    storeSelectionPage: { title: 'Choose', showLocationSelector: true, showActionFilters: true, distanceSuffix: 'km' },
    serviceSelectionPage: { timingsLabel: 'Hours' },
    locations: [{ id: 'one', name: 'Location One', enabled: true }, { id: 'two', name: 'Location Two', enabled: true }],
    actionCategories: [{ key: 'groom', label: 'Grooming', enabled: true }, { key: 'board', label: 'Boarding', enabled: true }],
    stores: [
      { id: 'one', name: 'Store One', locationId: 'one', actionKeys: ['groom'], enabled: true, services: [] },
      { id: 'two', name: 'Store Two', locationId: 'two', actionKeys: ['board'], enabled: true, services: [] },
      { id: 'off', name: 'Disabled', locationId: 'one', actionKeys: ['groom'], enabled: false, services: [] }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [StoreSelectionComponent, StoreCardComponent],
      providers: [
        { provide: SharedService, useValue: { getTemplateJSON: () => ({ serviceMarketplace: config }), getRouteID: () => 'account' } },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: Location, useValue: { back: jasmine.createSpy('back') } }
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

  it('opens the configured store route', () => {
    component.openStore(config.stores![0]);
    expect(router.navigateByUrl).toHaveBeenCalledWith('account/service-store/one');
  });
});

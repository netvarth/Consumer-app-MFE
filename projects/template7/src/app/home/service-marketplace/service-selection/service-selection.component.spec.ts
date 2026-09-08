import { CommonModule, Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';
import { ServiceCardComponent } from '../components/service-card/service-card.component';
import { ServiceMarketplaceConfig } from '../models/service-marketplace.models';
import { ServiceSelectionComponent } from './service-selection.component';

describe('ServiceSelectionComponent', () => {
  let fixture: ComponentFixture<ServiceSelectionComponent>;
  const router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
  const config: ServiceMarketplaceConfig = {
    enabled: true,
    routes: { storeSelection: 'service-stores', serviceSelection: 'service-store/:storeId' },
    storeSelectionPage: { storesEmptyTitle: 'Missing', storesEmptyDescription: 'Choose another', distanceSuffix: 'km' },
    serviceSelectionPage: { bookNowLabel: 'Reserve', startsAtLabel: 'From', timingsLabel: 'Hours' },
    stores: [{
      id: 'store', name: 'Configured Store', locationId: 'one', actionKeys: ['groom'], enabled: true,
      services: [
        { id: 'service', name: 'Configured Service', price: 100, serviceLink: 'appointment?service=one', enabled: true },
        { id: 'off', name: 'Disabled Service', enabled: false }
      ]
    }]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ServiceSelectionComponent, ServiceCardComponent],
      providers: [
        { provide: SharedService, useValue: { getTemplateJSON: () => ({ serviceMarketplace: config }), getRouteID: () => 'account' } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ storeId: 'store' }) } } },
        { provide: Router, useValue: router },
        { provide: Location, useValue: { back: jasmine.createSpy('back') } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ServiceSelectionComponent);
    fixture.detectChanges();
  });

  it('resolves the direct store route and renders enabled services', () => {
    expect(fixture.componentInstance.store?.id).toBe('store');
    expect(fixture.nativeElement.textContent).toContain('Configured Store');
    expect(fixture.nativeElement.textContent).toContain('Configured Service');
    expect(fixture.nativeElement.textContent).not.toContain('Disabled Service');
  });

  it('uses the configured service link', () => {
    fixture.componentInstance.book(config.stores![0].services![0]);
    expect(router.navigateByUrl).toHaveBeenCalledWith('account/appointment?service=one');
  });
});

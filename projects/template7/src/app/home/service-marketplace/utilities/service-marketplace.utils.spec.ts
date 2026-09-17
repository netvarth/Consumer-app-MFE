import {
  buildPhoneLink,
  getEnabledActions,
  getEnabledLocations,
  getEnabledServices,
  getFilteredStores,
  getStoreById,
  resolveMarketplaceImageUrl
} from './service-marketplace.utils';
import { ServiceMarketplaceConfig } from '../models/service-marketplace.models';

describe('service marketplace utilities', () => {
  const config: ServiceMarketplaceConfig = {
    enabled: true,
    assetBasePath: '/market/',
    routes: { storeSelection: 'stores', serviceSelection: 'store/:storeId' },
    locations: [
      { id: 'later', name: 'Later', enabled: true, sortOrder: 2 },
      { id: 'first', name: 'First', enabled: true, sortOrder: 1 },
      { id: 'off', name: 'Off', enabled: false, sortOrder: 0 }
    ],
    actionCategories: [
      { key: 'other', label: 'Other', enabled: false },
      { key: 'groom', label: 'Groom', enabled: true }
    ],
    stores: [
      { id: 'second', name: 'Second', locationId: 'first', actionKeys: ['groom'], enabled: true, sortOrder: 2, distanceKm: 5, services: [] },
      { id: 'first', name: 'First', locationId: 'first', actionKeys: ['groom'], enabled: true, sortOrder: 1, distanceKm: 2,
        services: [{ id: 'off', name: 'Off', enabled: false }, { id: 'on', name: 'On', enabled: true, sortOrder: 1 }] },
      { id: 'off', name: 'Off', locationId: 'first', actionKeys: ['groom'], enabled: false, services: [] }
    ]
  };

  it('filters disabled records and honors sort order', () => {
    expect(getEnabledLocations(config).map((item) => item.id)).toEqual(['first', 'later']);
    expect(getEnabledActions(config).map((item) => item.key)).toEqual(['groom']);
    expect(getFilteredStores(config, 'first', 'groom').map((item) => item.id)).toEqual(['first', 'second']);
    expect(getFilteredStores(config, 'later', 'groom')).toEqual([]);
  });

  it('matches every assigned location while preserving action and enabled filters', () => {
    const multiLocationConfig: ServiceMarketplaceConfig = {
      ...config,
      stores: [
        { id: 'multi', name: 'Multi', locationId: ['mumbai', 'thrissur'], actionKeys: ['groom'], enabled: true, distanceKm: 5 },
        { id: 'single', name: 'Single', locationId: 'mumbai', actionKeys: ['groom'], enabled: true, distanceKm: 2 },
        { id: 'off', name: 'Off', locationId: ['mumbai', 'thrissur'], actionKeys: ['groom'], enabled: false },
        { id: 'other-action', name: 'Other', locationId: ['mumbai', 'thrissur'], actionKeys: ['board'], enabled: true }
      ]
    };

    expect(getFilteredStores(multiLocationConfig, 'mumbai', 'groom').map((item) => item.id)).toEqual(['multi', 'single']);
    expect(getFilteredStores(multiLocationConfig, 'thrissur', 'groom').map((item) => item.id)).toEqual(['multi']);
    expect(getFilteredStores(multiLocationConfig, 'jaipur', 'groom')).toEqual([]);
    expect(getFilteredStores(multiLocationConfig, 'mum', 'groom')).toEqual([]);
    expect(getFilteredStores(multiLocationConfig, 'near-you', 'groom').map((item) => item.id)).toEqual(['single', 'multi']);
  });

  it('resolves stores and enabled services safely', () => {
    expect(getStoreById(config, 'first')?.name).toBe('First');
    expect(getStoreById(config, 'off')).toBeUndefined();
    expect(getEnabledServices(config.stores![1]).map((item) => item.id)).toEqual(['on']);
  });

  it('resolves images and phone links safely', () => {
    expect(resolveMarketplaceImageUrl('/market/', 'image.jpg')).toBe('/market/image.jpg');
    expect(resolveMarketplaceImageUrl('/market/', 'https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    expect(buildPhoneLink('+91 98765 43210', '')).toBe('tel:+919876543210');
    expect(buildPhoneLink('not supplied', '')).toBe('');
  });
});

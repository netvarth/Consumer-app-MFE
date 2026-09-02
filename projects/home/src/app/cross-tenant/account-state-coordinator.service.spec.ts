import { AccountStateCoordinator } from './account-state-coordinator.service';

describe('AccountStateCoordinator', () => {
  let coordinator: AccountStateCoordinator;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    coordinator = new AccountStateCoordinator();
  });

  it('isolates retained cart state and clears store/catalog selections across A -> B -> A', () => {
    coordinator.setActiveAccount('A');
    localStorage.setItem('cartData', JSON.stringify({ provider: 'A' }));
    localStorage.setItem('storeEncId', JSON.stringify('store-A'));
    localStorage.setItem('storeId', JSON.stringify(101));
    localStorage.setItem('active_catalog', JSON.stringify({ encId: 'catalog-A' }));
    localStorage.setItem('chosenDateTime', JSON.stringify({ provider: 'A' }));

    coordinator.transitionTo('B');
    coordinator.setActiveAccount('B');
    expect(localStorage.getItem('cartData')).toBeNull();
    expect(localStorage.getItem('storeEncId')).toBeNull();
    expect(localStorage.getItem('storeId')).toBeNull();
    expect(localStorage.getItem('active_catalog')).toBeNull();
    expect(localStorage.getItem('chosenDateTime')).toBeNull();
    localStorage.setItem('cartData', JSON.stringify({ provider: 'B' }));
    localStorage.setItem('storeEncId', JSON.stringify('store-B'));
    localStorage.setItem('storeId', JSON.stringify(202));
    localStorage.setItem('active_catalog', JSON.stringify({ encId: 'catalog-B' }));

    coordinator.transitionTo('A');
    coordinator.setActiveAccount('A');
    expect(JSON.parse(localStorage.getItem('cartData')!)).toEqual({ provider: 'A' });
    expect(localStorage.getItem('storeEncId')).toBeNull();
    expect(localStorage.getItem('storeId')).toBeNull();
    expect(localStorage.getItem('active_catalog')).toBeNull();
    expect(localStorage.getItem('chosenDateTime')).toBeNull();
  });

  it('does not restore store/catalog selections from legacy tenant snapshots', () => {
    localStorage.setItem('capp:activeAccountId:v1', 'B');
    localStorage.setItem('storeEncId', JSON.stringify('store-B'));
    localStorage.setItem('storeId', JSON.stringify(202));
    localStorage.setItem('active_catalog', JSON.stringify({ encId: 'catalog-B' }));
    localStorage.setItem('capp:tenant-state:v1:A', JSON.stringify({
      version: 1,
      updatedAt: Date.now(),
      values: {
        storeEncId: JSON.stringify('legacy-store-A'),
        storeId: JSON.stringify(101),
        active_catalog: JSON.stringify({ encId: 'legacy-catalog-A' })
      }
    }));

    coordinator.transitionTo('A');

    expect(localStorage.getItem('storeEncId')).toBeNull();
    expect(localStorage.getItem('storeId')).toBeNull();
    expect(localStorage.getItem('active_catalog')).toBeNull();
  });

  it('never snapshots active authentication or provider-consumer state', () => {
    localStorage.setItem('capp:activeAccountId:v1', 'A');
    localStorage.setItem('c_authorizationToken', JSON.stringify('session-A'));
    localStorage.setItem('0', JSON.stringify({ jld_scon: { id: 1 }, anotherValue: true }));
    coordinator.transitionTo('B');
    expect(localStorage.getItem('c_authorizationToken')).toBeNull();
    expect(JSON.parse(localStorage.getItem('0')!)).toEqual({ anotherValue: true });
    expect(localStorage.getItem('capp:tenant-state:v1:A')).not.toContain('session-A');
    expect(localStorage.getItem('capp:tenant-state:v1:A')).not.toContain('jld_scon');
  });
});

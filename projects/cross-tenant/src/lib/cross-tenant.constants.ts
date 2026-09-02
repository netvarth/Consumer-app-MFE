export const PLATFORM_TOKEN_KEY = 'platform_token';
export const CROSS_TENANT_SESSION_KEY = 'capp:crossTenantSsoSession:v1';
export const ACTIVE_ACCOUNT_KEY = 'capp:activeAccountId:v1';
export const TENANT_STATE_PREFIX = 'capp:tenant-state:v1:';
export const TENANT_STATE_REGISTRY_KEY = 'capp:tenant-state-registry:v1';

export const RETAINED_ACCOUNT_KEYS = [
  'cartData',
  'deliveryType',
  'cartNote',
  'isSessionCart',
  'activeLocation',
  'c-location'
] as const;

export const TRANSIENT_ACCOUNT_KEYS = [
  'storeEncId',
  'storeId',
  'active_catalog',
  'target',
  'itemTarget',
  'pendingWishlistItem',
  'serviceOPtionInfo',
  'chosenDateTime',
  'order',
  'order_sp',
  'order_spId',
  'itemArray',
  'deliveryAddress',
  'reqFrom',
  'source',
  'p_src',
  'orderStat',
  'onlineOrder',
  'serviceTotalPrice',
  'quesStore',
  'isCheckin',
  'showTelePop',
  'ynw-locdet'
] as const;

export const ACTIVE_AUTH_KEYS = [
  'c_authorizationToken',
  'refreshToken',
  'authorization',
  'logout',
  'googleToken'
] as const;

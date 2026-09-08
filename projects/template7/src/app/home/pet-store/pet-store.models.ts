export interface PetStoreLink {
  label: string;
  link: string;
}

export interface PetStoreImageItem {
  id: string;
  name: string;
  imageAlt?: string;
  link?: string;
  enabled?: boolean;
  sortOrder?: number;
  cardImage?: string;
  logo?: string;
  image?: string;
}

export interface PetStoreSection {
  enabled?: boolean;
  title?: string;
  cardMode?: string;
  seeAll?: PetStoreLink;
  items?: PetStoreImageItem[];
}

export interface PetStoreAction {
  key: string;
  label: string;
  icon: string;
  link?: string;
  enabled?: boolean;
  sortOrder?: number;
}

export interface PetStorePageConfig {
  schemaVersion?: number;
  enabled?: boolean;
  route?: string;
  assetBasePath?: string;
  footerNavigationItem?: PetStoreAction;
  layout?: {
    hideParentHeader?: boolean;
    useParentFooterNavigation?: boolean;
    renderOwnHeader?: boolean;
    mobileFirst?: boolean;
    referenceViewportWidth?: number;
    contentMaxWidth?: number;
    pageBackground?: string;
    shopsSectionBackground?: string;
  };
  hero?: {
    backgroundImage?: string;
    backgroundImageAlt?: string;
    backgroundFit?: string;
    backgroundPosition?: string;
    logo?: { image?: string; imageAlt?: string; link?: string; enabled?: boolean };
    deliveryLocation?: {
      eyebrow?: string;
      value?: string;
      locationIcon?: string;
      dropdownIcon?: string;
      link?: string;
      enabled?: boolean;
    };
    actions?: PetStoreAction[];
    search?: {
      enabled?: boolean;
      placeholder?: string;
      icon?: string;
      ariaLabel?: string;
      submitOnEnter?: boolean;
      searchRoute?: string;
      queryParameter?: string;
    };
    intro?: { title?: string; subtitle?: string; subtitleIcon?: string };
  };
  categories?: PetStoreSection;
  brands?: PetStoreSection;
  shops?: PetStoreSection;
  offers?: PetStoreSection & {
    displayMode?: string;
    showIndicators?: boolean;
    showArrows?: boolean;
    autoPlay?: boolean;
    autoPlayIntervalMs?: number;
    pauseOnInteraction?: boolean;
    loop?: boolean;
  };
  emptyStates?: {
    categories?: { title?: string; description?: string };
    brands?: { title?: string; description?: string };
    shops?: { title?: string; description?: string };
    offers?: { title?: string; description?: string };
    [key: string]: { title?: string; description?: string } | undefined;
  };
}

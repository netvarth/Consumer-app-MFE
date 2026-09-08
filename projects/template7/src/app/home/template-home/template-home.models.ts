/** Schema v1 is deliberately independent of the marketplace/legacy home contract. */
export interface HomeLink {
  route?: string[];
  queryParams?: Record<string, string>;
  url?: string;
}

export interface HomeImage {
  src: string;
  alt: string;
  fit: 'contain' | 'cover';
  width: number;
  height: number;
}

export interface HomePosition {
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export interface HomeCard {
  key: string;
  label: string;
  description: string;
  image: HomeImage;
  link: HomeLink | null;
  price: string;
  tag: string;
  provider: string;
  actionLabel: string;
}

export interface HomeSection {
  title: string;
  items: HomeCard[];
}

export interface HomeHero {
  image: HomeImage;
  search: {
    placeholder: string;
    ariaLabel: string;
    position: HomePosition;
    link: HomeLink | null;
  } | null;
  action: {
    ariaLabel: string;
    position: HomePosition;
    link: HomeLink | null;
  } | null;
}

export interface HomeServices extends HomeSection {
  showTitle: boolean;
  coverImage: HomeImage | null;
  columnsMobile: number;
  columnsDesktop: number;
  cardImageAspectRatio: string;
}

export interface HomeFooterItem {
  key: string;
  label: string;
  icon: string;
  link: HomeLink | null;
}

export interface TemplateHomeConfig {
  status: 'loading' | 'legacy' | 'unavailable' | 'disabled' | 'ready';
  type: 'store' | 'service';
  layout: { contentMaxWidth: number; pageBackground: string; activeFooterKey: string };
  hero: HomeHero | null;
  categories: HomeSection | null;
  bestSellers: HomeSection | null;
  services: HomeServices | null;
  footer: HomeFooterItem[];
  diagnostics: string[];
}

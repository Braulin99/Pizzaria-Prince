export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  date: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface SiteContentItem {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image';
  description: string;
}

export interface CartItem extends Omit<MenuItem, 'id'> {
  id: string;
  quantity: number;
}

export type SiteContent = Record<string, string>;

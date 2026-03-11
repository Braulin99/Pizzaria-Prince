export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export interface Review {
  id: number;
  author: string;
  content: string;
  rating: number;
  date: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type SiteContent = Record<string, string>;

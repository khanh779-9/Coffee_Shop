export interface HeroContent {
  badge: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  backgroundImage: string;
}

export interface MenuTab {
  code: string;
  name: string;
}

export interface DrinkItem {
  id: number;
  categoryCode: string;
  categoryLabel: string;
  name: string;
  rating: number;
  priceFrom: number;
  imageUrl: string;
  description: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  note?: string;
  items: CreateOrderItem[];
}

export interface CreatedOrder {
  id: number;
  totalAmount: number;
  status: string;
}

export interface AdminOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  note: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  items: AdminOrderItem[] | string;
}

export interface AdminCategory {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: number | boolean;
}

export interface AdminProduct {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  rating: number;
  priceFrom: number;
  imageUrl: string;
  isFeatured: number | boolean;
  isActive: number | boolean;
}

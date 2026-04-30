export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  material: string;
  style: string;
  images: string[];
  isMadeInNigeria: boolean;
  hasAssemblyService: boolean;
  assemblyCost?: number;
  isEscrowProtected: boolean;
  installmentOptions?: string[];
  seller: {
    name: string;
    rating: number;
    isVerified: boolean;
    location: string;
    tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  stock: number;
  deliverySLA: string;
  model3d?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  image: string;
  productIds: string[];
  category: string;
}

export interface Designer {
  id: string;
  name: string;
  bio: string;
  image: string;
  styles: string[];
  notableWorks: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
}

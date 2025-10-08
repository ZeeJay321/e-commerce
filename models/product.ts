export interface ProductVariant {
  id: string;
  color: string;
  colorCode: string;
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  variantId: string;
  title: string;
  img: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

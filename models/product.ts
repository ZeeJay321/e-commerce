export interface ProductVariant {
  id: string;
  img: string;
  color: string;
  colorCode: string;
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

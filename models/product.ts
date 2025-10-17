export enum Size {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL'
}

export interface ProductVariant {
  id: string;
  img: string;
  color: string;
  colorCode: string;
  size: Size;
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

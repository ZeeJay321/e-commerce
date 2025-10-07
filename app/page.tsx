'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import LoadingSpinner from '@/components/loading/loading-spinner';
import ProductGrid from '@/components/product-grid/product-grid-functionality';
import SearchBar from '@/components/search-bar/search-bar-functionality';
import Sort from '@/components/sort/sort-functionality';

import { CartItem } from '@/models';
import 'antd/dist/reset.css';
import './globals.css';

const Page = () => {
  const { data: session } = useSession();

  const [isRendered, setIsRendered] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<string | null>(null);

  useEffect(() => {
    setIsRendered(true);
    if (!session?.user?.id) return;

    try {
      const userId = session.user.id;
      const userCartKey = `userCartData_${userId}`;
      const storedUserCart = localStorage.getItem(`userCartData_${userId}`);
      if (!storedUserCart) return;

      const parsedUserCart: CartItem[] = JSON.parse(storedUserCart);
      const currentCart: CartItem[] = JSON.parse(localStorage.getItem('cartData') || '[]');

      const mergedMap = new Map<string, CartItem>();

      [...currentCart, ...parsedUserCart].forEach((item) => {
        const existing = mergedMap.get(item.id);
        mergedMap.set(item.id, existing
          ? { ...existing, qty: existing.qty + item.qty }
          : item);
      });

      const merged = Array.from(mergedMap.values());

      localStorage.setItem('cartData', JSON.stringify(merged));
      localStorage.removeItem(userCartKey);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error restoring user cart:', err);
    }
  }, [session]);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-scroll">
      <div className="content-div">
        <span className="content-paragraph">Our Products</span>
        <div className="content-features w-full">
          <SearchBar onSearch={setSearch} />
          <Sort onChange={setSortOption} />
        </div>
      </div>

      <ProductGrid search={search} sortOption={sortOption} />
    </div>
  );
};

export default Page;

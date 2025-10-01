import { CartItem, OutOfStockItem } from '@/models';

export function updateCartOnError(
  outOfStock: OutOfStockItem[],
  storageKey = 'cartData'
): CartItem[] {
  if (!outOfStock || outOfStock.length === 0) return [];

  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];

  let cart: CartItem[] = JSON.parse(raw);

  const oosMap = new Map(outOfStock.map((o) => [o.productId, o.availableStock]));

  cart = cart.map((c) => {
    const avail = oosMap.get(c.id);
    if (typeof avail === 'number') {
      return {
        ...c,
        stock: Math.max(0, avail),
        qty: Math.min(c.qty, avail)
      };
    }
    return c;
  });

  cart = cart.filter((c) => c.qty > 0 && c.stock > 0);

  localStorage.setItem(storageKey, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));

  return cart;
}

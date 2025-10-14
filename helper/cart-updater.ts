import { CartItem, OutOfStockItem } from '@/models';

export function updateCartStockOnly(
  outOfStock: OutOfStockItem[],
  storageKey = 'cartData',
  triggerEvent = true
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
        stock: Math.max(0, avail)
      };
    }
    return c;
  });

  localStorage.setItem(storageKey, JSON.stringify(cart));

  if (triggerEvent === true) {
    window.dispatchEvent(new Event('cartUpdated'));
  }

  return cart;
}

// Daily Deals — shared client-side store.
// Centralizes every localStorage key so nothing is scattered across pages.
// NOTE: this is a frontend-prototype data layer. Cart, wishlist and orders
// live in the browser only. When the backend is wired up (Phase 4+), these
// functions are the only place that needs to change to call the real API.

const STORAGE_KEYS = {
  cart: 'dailyDealsCart',
  wishlist: 'dailyDealsWishlist',
  recentlyViewed: 'dailyDealsRecentlyViewed',
  orders: 'dailyDealsOrders',
  coupon: 'dailyDealsCoupon',
  profile: 'dailyDealsProfile',
  addresses: 'dailyDealsAddresses',
  settings: 'dailyDealsSettings',
};

const FREE_SHIPPING_THRESHOLD = 499;
const SHIPPING_FEE = 79;

const COUPONS = {
  SAVE10: { type: 'percent', value: 10, label: '10% off' },
  FLAT100: { type: 'flat', value: 100, label: '₹100 off' },
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------- Cart ----------------
// Cart items store only { id, quantity } — never the full product object,
// so product details (price, stock, images) always come fresh from PRODUCTS.

function getCart() {
  return readJSON(STORAGE_KEYS.cart, []);
}

function saveCart(cart) {
  writeJSON(STORAGE_KEYS.cart, cart);
  renderCartBadge();
}

function addToCart(productId, quantity) {
  quantity = quantity || 1;
  const product = getProductById(productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  const currentQty = existing ? existing.quantity : 0;
  const nextQty = Math.min(currentQty + quantity, product.stock);
  if (existing) {
    existing.quantity = nextQty;
  } else {
    cart.push({ id: productId, quantity: nextQty });
  }
  saveCart(cart);
  bumpCartBadge();
  return nextQty;
}

function setCartQuantity(productId, quantity) {
  const product = getProductById(productId);
  if (!product) return;
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.quantity = Math.max(1, Math.min(quantity, product.stock));
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
  clearCoupon();
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getCartLines() {
  return getCart()
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) return null;
      return { product, quantity: item.quantity, lineTotal: product.price * item.quantity };
    })
    .filter(Boolean);
}

function getCartTotals(couponCode) {
  if (couponCode === undefined) couponCode = getCoupon();
  const lines = getCartLines();
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  let discount = 0;
  let couponLabel = null;
  if (couponCode && COUPONS[couponCode.toUpperCase()]) {
    const c = COUPONS[couponCode.toUpperCase()];
    discount = c.type === 'percent' ? Math.round(subtotal * (c.value / 100)) : Math.min(c.value, subtotal);
    couponLabel = c.label;
  }
  const total = Math.max(subtotal + shipping - discount, 0);
  return { lines, subtotal, shipping, discount, total, couponLabel };
}

// ---------------- Wishlist ----------------

function getWishlist() {
  return readJSON(STORAGE_KEYS.wishlist, []);
}

function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

function toggleWishlist(productId) {
  let list = getWishlist();
  const active = list.includes(productId);
  list = active ? list.filter((id) => id !== productId) : list.concat(productId);
  writeJSON(STORAGE_KEYS.wishlist, list);
  return !active;
}

// ---------------- Recently viewed ----------------

function pushRecentlyViewed(productId) {
  let list = getRecentlyViewed().filter((id) => id !== productId);
  list.unshift(productId);
  list = list.slice(0, 8);
  writeJSON(STORAGE_KEYS.recentlyViewed, list);
}

function getRecentlyViewed() {
  return readJSON(STORAGE_KEYS.recentlyViewed, []);
}

// ---------------- Coupon ----------------
// Stored under its own key — a coupon code is not part of the cart's array
// shape, so stashing it as a property on the cart array would silently be
// dropped by JSON.stringify on the next save.

function getCoupon() {
  return localStorage.getItem(STORAGE_KEYS.coupon) || null;
}

function setCoupon(code) {
  if (code) localStorage.setItem(STORAGE_KEYS.coupon, code);
  else localStorage.removeItem(STORAGE_KEYS.coupon);
}

function clearCoupon() {
  localStorage.removeItem(STORAGE_KEYS.coupon);
}

// ---------------- Orders ----------------

function generateOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return 'DD' + Date.now().toString().slice(-6) + rand;
}

function createOrder(address, paymentMethod) {
  const { lines, subtotal, shipping, discount, total } = getCartTotals();
  if (lines.length === 0) return null;

  const order = {
    orderNumber: generateOrderNumber(),
    placedAt: new Date().toISOString(),
    items: lines.map((l) => ({
      id: l.product.id,
      name: l.product.name,
      image: l.product.images[0],
      price: l.product.price,
      quantity: l.quantity,
    })),
    address,
    paymentMethod,
    subtotal,
    shipping,
    discount,
    total,
    status: 'Confirmed',
  };

  const orders = getOrders();
  orders.unshift(order);
  writeJSON(STORAGE_KEYS.orders, orders);
  saveAddress(address);
  clearCart();
  return order;
}

function getOrders() {
  return readJSON(STORAGE_KEYS.orders, []);
}

function getOrderByNumber(orderNumber) {
  return getOrders().find((o) => o.orderNumber === orderNumber);
}

// ---------------- Address book ----------------
// Populated automatically whenever an order is placed, so Account > Addresses
// has real content without requiring a separate "save address" step.

function getAddresses() {
  return readJSON(STORAGE_KEYS.addresses, []);
}

function saveAddress(address) {
  if (!address) return;
  const list = getAddresses();
  const isDuplicate = list.some(
    (a) => a.pincode === address.pincode && a.address === address.address && a.fullName === address.fullName
  );
  if (!isDuplicate) {
    list.unshift(address);
    writeJSON(STORAGE_KEYS.addresses, list.slice(0, 5));
  }
}

// ---------------- Profile (demo — no real authentication) ----------------

function getProfile() {
  return readJSON(STORAGE_KEYS.profile, { name: '', email: '', phone: '' });
}

function saveProfile(profile) {
  writeJSON(STORAGE_KEYS.profile, profile);
}

function clearProfile() {
  localStorage.removeItem(STORAGE_KEYS.profile);
}

// ---------------- Settings ----------------

function getSettings() {
  return readJSON(STORAGE_KEYS.settings, { emailUpdates: true, smsUpdates: false });
}

function saveSettings(settings) {
  writeJSON(STORAGE_KEYS.settings, settings);
}

// ---------------- Shared UI: header badge, toast, nav ----------------

function renderCartBadge() {
  document.querySelectorAll('.js-cart-count').forEach((el) => {
    const count = getCartCount();
    el.textContent = count;
    el.classList.toggle('hidden', count === 0);
  });
}

function bumpCartBadge() {
  document.querySelectorAll('.js-cart-count').forEach((el) => {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  });
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function starString(rating) {
  const full = Math.round(rating);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

function initSharedChrome() {
  renderCartBadge();

  const navEl = document.getElementById('siteNav');
  if (navEl) {
    window.addEventListener('scroll', () => navEl.classList.toggle('scrolled', window.scrollY > 8));
  }

  const toggle = document.getElementById('mobileToggle');
  const panel = document.getElementById('mobilePanel');
  if (toggle && panel) {
    toggle.addEventListener('click', () => panel.classList.toggle('open'));
  }

  // wire any mobile search box to redirect to shop.html?search=
  document.querySelectorAll('.js-search-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const q = input.value.trim();
      window.location.href = 'shop.html' + (q ? '?search=' + encodeURIComponent(q) : '');
    });
  });
}

document.addEventListener('DOMContentLoaded', initSharedChrome);

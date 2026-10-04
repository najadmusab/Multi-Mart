// Daily Deals — shared header & footer, injected into every page from one
// place so nav/footer edits never have to be made in five files separately.

function renderHeader(activePage) {
  const el = document.getElementById('site-header');
  if (!el) return;

  const link = (href, label, key) =>
    `<a href="${href}" class="${activePage === key ? 'active' : ''}">${label}</a>`;

  el.innerHTML = `
    <div class="utility-bar">
      <div class="container">
        <span>Free shipping on orders above ₹499</span>
        <a href="tel:+919417145296">Call us: +91 94171 45296</a>
      </div>
    </div>
    <header class="nav" id="siteNav">
      <div class="container nav-row">
        <a href="index.html" class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8 4 5 8 5 13a7 7 0 0014 0c0-5-3-9-7-11z" fill="#1F3A2E"/><path d="M12 22V11" stroke="#FAF8F1" stroke-width="1.4"/></svg>
          Daily Deals
        </a>
        <nav class="nav-links">
          ${link('index.html', 'Home', 'home')}
          ${link('shop.html', 'Shop', 'shop')}
          ${link('shop.html#categories', 'Categories', 'categories')}
          ${link('shop.html?filter=new', 'New Arrivals', 'new')}
          ${link('shop.html?filter=deals', 'Deals', 'deals')}
        </nav>
        <form class="search-box js-search-form">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" placeholder="Search products..." aria-label="Search products">
        </form>
        <div class="nav-actions">
          <a class="icon-btn" href="account.html" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/></svg>
          </a>
          <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.9-10-9.3C.4 8.1 2 4.5 5.6 4c2.1-.3 4 .8 6.4 3 2.4-2.2 4.3-3.3 6.4-3 3.6.5 5.2 4.1 3.6 7.7-2.5 4.4-10 9.3-10 9.3z"/></svg>
          </a>
          <a class="icon-btn" href="cart.html" aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h2l1.5 11.5A2 2 0 009.5 18h7a2 2 0 002-1.7L20 8H6"/><circle cx="10" cy="21" r="1.3"/><circle cx="17" cy="21" r="1.3"/></svg>
            <span class="badge-count js-cart-count hidden" id="cartCount">0</span>
          </a>
          <button class="mobile-toggle" id="mobileToggle" aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <div class="mobile-panel" id="mobilePanel">
        <form class="search-box js-search-form">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" placeholder="Search products..." aria-label="Search products">
        </form>
        ${link('index.html', 'Home', 'home')}
        ${link('shop.html', 'Shop', 'shop')}
        ${link('shop.html#categories', 'Categories', 'categories')}
        ${link('shop.html?filter=new', 'New Arrivals', 'new')}
        ${link('shop.html?filter=deals', 'Deals', 'deals')}
        ${link('wishlist.html', 'Wishlist', 'wishlist')}
      </div>
    </header>
  `;
}

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;

  el.innerHTML = `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8 4 5 8 5 13a7 7 0 0014 0c0-5-3-9-7-11z" fill="#F1EADC"/><path d="M12 22V11" stroke="#152920" stroke-width="1.4"/></svg>
              Daily Deals
            </a>
            <p>More than a store. A better everyday — natural, well-made products delivered across India.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="shop.html">All products</a></li>
              <li><a href="shop.html?filter=new">New arrivals</a></li>
              <li><a href="shop.html?filter=deals">Deals</a></li>
              <li><a href="shop.html#categories">Categories</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="tracking.html">Track order</a></li>
              <li><a href="#" onclick="event.preventDefault(); showToast('Returns page is coming in a later phase.')">Returns &amp; exchanges</a></li>
              <li><a href="#" onclick="event.preventDefault(); showToast('Shipping info page is coming in a later phase.')">Shipping info</a></li>
              <li><a href="tel:+919417145296">+91 94171 45296</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#" onclick="event.preventDefault(); showToast('About page is coming in a later phase.')">About us</a></li>
              <li><a href="#" onclick="event.preventDefault(); showToast('Privacy policy is coming in a later phase.')">Privacy policy</a></li>
              <li><a href="#" onclick="event.preventDefault(); showToast('Terms of service is coming in a later phase.')">Terms of service</a></li>
              <li><a href="#" onclick="event.preventDefault(); showToast('Refund policy is coming in a later phase.')">Refund policy</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Daily Deals. All rights reserved.</span>
          <span>Made for everyday India.</span>
        </div>
      </div>
    </footer>
    <div class="toast" id="toast">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
      <span id="toastMsg">Added to cart</span>
    </div>
  `;
}

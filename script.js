const PRODUCT_IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23e9ecdf'/%3E%3Ccircle cx='300' cy='250' r='120' fill='%23d9e2cd'/%3E%3Ctext x='300' y='430' text-anchor='middle' font-family='Arial,sans-serif' font-size='36' fill='%235f715f'%3EImage unavailable%3C/text%3E%3C/svg%3E";
const CATEGORY_ICONS = {
 Groceries: "🥬",
 "Personal care": "🧴",
 "Home care": "🧹",
 Snacks: "🍪",
 Beverages: "🥤"
};

const money = n => "৳" + Number(n).toLocaleString("en-BD");
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

let activeCategory = "All";
let query = "";
let sortMode = "featured";
let toastTimer;
let selectedProduct = null;
let modalQty = 1;
let lastFocusedElement = null;

let cart = {};
try { cart = JSON.parse(localStorage.getItem("dailymart-cart") || "{}") || {}; } catch { cart = {}; }

function normalizeProducts(list) {
 if (!Array.isArray(list)) return [];
 return list.map((item, index) => {
  const raw = item || {};
  const safeName = String(raw.name || "").trim() || `Product ${index + 1}`;
  const safeCategory = String(raw.category || "").trim() || "Other";
  const safeImage = typeof raw.image === "string" && raw.image.trim() ? raw.image.trim() : PRODUCT_IMAGE_FALLBACK;
  return {
   id: Number(raw.id) || index + 1,
   name: safeName,
   price: Number(raw.price) || 0,
   description: String(raw.description || "").trim() || "Product details coming soon.",
   category: safeCategory,
   image: safeImage,
   unit: String(raw.unit || "item").trim() || "item",
   badge: String(raw.badge || "").trim(),
   alt: String(raw.alt || safeName)
  };
 });
}

const products = normalizeProducts(window.DAILYMART_PRODUCTS);

function saveCart() { try { localStorage.setItem("dailymart-cart", JSON.stringify(cart)); } catch {} }

function filteredProducts() {
 let list = products.filter(p => {
  const text = `${p.name} ${p.category} ${p.unit} ${p.description}`.toLowerCase();
  return (activeCategory === "All" || p.category === activeCategory) && text.includes(query.toLowerCase());
 });
 if (sortMode === "low") list.sort((a, b) => a.price - b.price);
 if (sortMode === "high") list.sort((a, b) => b.price - a.price);
 if (sortMode === "name") list.sort((a, b) => a.name.localeCompare(b.name));
 return list;
}

function applyImageFallback(imageElements) {
 imageElements.forEach(img => {
  img.addEventListener("error", () => {
   img.src = PRODUCT_IMAGE_FALLBACK;
   img.alt = "Image unavailable";
  }, { once: true });
 });
}

function renderCategoryChips() {
 const categories = [...new Set(products.map(product => product.category))];
 $("categoryRow").innerHTML = [
  '<button class="category-chip active" data-category="All">All Products <span>↗</span></button>',
  ...categories.map(category => `<button class="category-chip" data-category="${escapeHtml(category)}">${CATEGORY_ICONS[category] || "🛍️"} ${escapeHtml(category)}</button>`)
 ].join("");
}

function renderProducts() {
 const list = filteredProducts();
 $("resultCount").textContent = query ? `${list.length} result${list.length === 1 ? "" : "s"} for “${query}”` : activeCategory === "All" ? "Showing all essentials" : `Showing ${activeCategory.toLowerCase()}`;
 $("productGrid").innerHTML = list.map(p => `
  <article class="product-card" data-product-id="${p.id}" role="button" tabindex="0" aria-label="View details for ${escapeHtml(p.name)}">
    <div class="product-visual">
      ${p.badge ? `<span class="product-badge">${escapeHtml(p.badge)}</span>` : ""}
      <img class="product-image" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.alt)}" loading="lazy">
      <button class="quick-add" data-add="${p.id}" aria-label="Add ${escapeHtml(p.name)} to cart">+</button>
    </div>
    <div class="product-info">
      <div class="product-category">${escapeHtml(p.category)}</div>
      <h3 class="product-name">${escapeHtml(p.name)}</h3>
      <p class="product-description">${escapeHtml(p.description)}</p>
      <div class="product-bottom">
        <div class="product-price">${money(p.price)} <span class="product-unit">/ ${escapeHtml(p.unit)}</span></div>
        <span class="rating">✳ <span>4.8</span></span>
      </div>
    </div>
  </article>
 `).join("");
 applyImageFallback(document.querySelectorAll(".product-image"));
 $("emptyState").classList.toggle("hidden", list.length !== 0);
}

function cartCount() { return Object.values(cart).reduce((sum, qty) => sum + Number(qty), 0); }
function cartTotal() { return products.reduce((sum, p) => sum + p.price * (Number(cart[p.id]) || 0), 0); }

function renderCart() {
 const count = cartCount();
 const total = cartTotal();
 $("cartCount").textContent = count;
 $("drawerCount").textContent = `(${count})`;
 $("cartItems").innerHTML = products.filter(p => cart[p.id]).map(p => `
  <div class="cart-line">
    <img class="cart-thumb cart-image" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.alt)}">
    <div>
      <h4>${escapeHtml(p.name)}</h4>
      <small>${escapeHtml(p.unit)}</small>
      <div class="line-price">${money(p.price * cart[p.id])}</div>
      <div class="quantity-control">
        <button data-change="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
        <span>${cart[p.id]}</span>
        <button data-change="${p.id}" data-delta="1" aria-label="Increase quantity">+</button>
      </div>
    </div>
    <button class="remove-item" data-remove="${p.id}" aria-label="Remove ${escapeHtml(p.name)}">×</button>
  </div>
 `).join("");
 applyImageFallback(document.querySelectorAll(".cart-image"));
 const empty = count === 0;
 $("cartEmpty").classList.toggle("hidden", !empty);
 $("cartSummary").classList.toggle("hidden", empty);
 $("subtotal").textContent = money(total);
 $("cartTotal").textContent = money(total);
 $("checkoutTotal").textContent = money(total);
}

function toast(message) {
 const el = $("toast");
 el.textContent = message;
 el.classList.add("show");
 clearTimeout(toastTimer);
 toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function addToCart(id, qty = 1) {
 const safeQty = Math.max(1, Number(qty) || 1);
 cart[id] = (Number(cart[id]) || 0) + safeQty;
 saveCart();
 renderCart();
 toast(safeQty > 1 ? `Added ${safeQty} items to your cart` : "Added to your cart");
}

function changeQty(id, delta) {
 cart[id] = (Number(cart[id]) || 0) + delta;
 if (cart[id] <= 0) delete cart[id];
 saveCart();
 renderCart();
}

function openCart() {
 renderCart();
 $("overlay").classList.add("open");
 $("cartDrawer").classList.add("open");
 $("cartDrawer").setAttribute("aria-hidden", "false");
 document.body.style.overflow = "hidden";
}

function closeCart() {
 $("overlay").classList.remove("open");
 $("cartDrawer").classList.remove("open");
 $("cartDrawer").setAttribute("aria-hidden", "true");
 document.body.style.overflow = "";
}

function openCheckout() {
 if (cartCount() === 0) return;
 closeCart();
 $("checkoutBackdrop").classList.add("open");
 $("checkoutForm").classList.remove("hidden");
 $("orderSuccess").classList.add("hidden");
 $("checkoutTotal").textContent = money(cartTotal());
 document.body.style.overflow = "hidden";
}

function closeCheckout() {
 $("checkoutBackdrop").classList.remove("open");
 document.body.style.overflow = "";
}

function updateModalQtyDisplay() {
 $("modalQtyValue").textContent = String(modalQty);
}

function openProductModal(productId, sourceElement = null) {
 selectedProduct = products.find(product => product.id === productId) || null;
 if (!selectedProduct) return;
 modalQty = 1;
 lastFocusedElement = sourceElement || document.activeElement;
 $("productModalImage").src = selectedProduct.image;
 $("productModalImage").alt = selectedProduct.alt;
 $("productModalCategory").textContent = selectedProduct.category;
 $("productModalTitle").textContent = selectedProduct.name;
 $("productModalPrice").textContent = `${money(selectedProduct.price)} / ${selectedProduct.unit}`;
 $("productModalDescription").textContent = selectedProduct.description;
 updateModalQtyDisplay();
 applyImageFallback([$("productModalImage")]);
 $("productBackdrop").classList.add("open");
 document.body.style.overflow = "hidden";
 $("closeProductModal").focus();
}

function closeProductModal() {
 $("productBackdrop").classList.remove("open");
 selectedProduct = null;
 modalQty = 1;
 if (!$("checkoutBackdrop").classList.contains("open") && !$("cartDrawer").classList.contains("open")) {
  document.body.style.overflow = "";
 }
 if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
  lastFocusedElement.focus();
 }
}

function addModalSelectionToCart() {
 if (!selectedProduct) return;
 addToCart(selectedProduct.id, modalQty);
 closeProductModal();
}

$("productGrid").addEventListener("click", event => {
 const quickAddButton = event.target.closest("[data-add]");
 if (quickAddButton) {
  event.stopPropagation();
  addToCart(Number(quickAddButton.dataset.add));
  return;
 }
 const card = event.target.closest("[data-product-id]");
 if (card) {
  openProductModal(Number(card.dataset.productId), card);
 }
});

$("productGrid").addEventListener("keydown", event => {
 const card = event.target.closest("[data-product-id]");
 if (!card) return;
 if (event.key === "Enter" || event.key === " ") {
  event.preventDefault();
  openProductModal(Number(card.dataset.productId), card);
 }
});

$("cartItems").addEventListener("click", event => {
 const quantityButton = event.target.closest("[data-change]");
 const removeButton = event.target.closest("[data-remove]");
 if (quantityButton) changeQty(Number(quantityButton.dataset.change), Number(quantityButton.dataset.delta));
 if (removeButton) {
  delete cart[removeButton.dataset.remove];
  saveCart();
  renderCart();
 }
});

$("categoryRow").addEventListener("click", event => {
 const button = event.target.closest("[data-category]");
 if (!button) return;
 activeCategory = button.dataset.category;
 document.querySelectorAll(".category-chip").forEach(chip => chip.classList.toggle("active", chip === button));
 renderProducts();
});

$("searchInput").addEventListener("input", event => {
 query = event.target.value.trim();
 renderProducts();
});

$("sortSelect").addEventListener("change", event => {
 sortMode = event.target.value;
 renderProducts();
});

$("clearFilters").addEventListener("click", () => {
 activeCategory = "All";
 query = "";
 $("searchInput").value = "";
 document.querySelectorAll(".category-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === "All"));
 renderProducts();
});

$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);
$("continueShopping").addEventListener("click", () => {
 closeCart();
 $("shop").scrollIntoView({ behavior: "smooth" });
});

$("checkoutButton").addEventListener("click", openCheckout);
$("closeCheckout").addEventListener("click", closeCheckout);
$("checkoutBackdrop").addEventListener("click", event => {
 if (event.target === $("checkoutBackdrop")) closeCheckout();
});

$("checkoutForm").addEventListener("submit", event => {
 event.preventDefault();
 if (!event.currentTarget.reportValidity()) return;
 $("checkoutForm").classList.add("hidden");
 $("orderSuccess").classList.remove("hidden");
});

$("finishOrder").addEventListener("click", () => {
 cart = {};
 saveCart();
 renderCart();
 closeCheckout();
 renderProducts();
 toast("Thanks for trying the DailyMart demo");
});

$("accountButton").addEventListener("click", () => toast("Account sign-in is not connected in this demo"));

$("closeProductModal").addEventListener("click", closeProductModal);
$("productBackdrop").addEventListener("click", event => {
 if (event.target === $("productBackdrop")) closeProductModal();
});
$("increaseModalQty").addEventListener("click", () => {
 modalQty += 1;
 updateModalQtyDisplay();
});
$("decreaseModalQty").addEventListener("click", () => {
 modalQty = Math.max(1, modalQty - 1);
 updateModalQtyDisplay();
});
$("addModalToCart").addEventListener("click", addModalSelectionToCart);

document.addEventListener("keydown", event => {
 if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
  event.preventDefault();
  $("searchInput").focus();
 }
 if (event.key === "Escape") {
  if ($("productBackdrop").classList.contains("open")) {
   closeProductModal();
   return;
  }
  closeCart();
  closeCheckout();
 }
});

$("year").textContent = new Date().getFullYear();
renderCategoryChips();
renderProducts();
renderCart();

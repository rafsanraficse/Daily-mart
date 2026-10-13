const products = (Array.isArray(window.DAILYMART_PRODUCTS) ? window.DAILYMART_PRODUCTS : []).map((item, index) => ({
  id: Number(item.id) || index + 1,
  name: String(item.name || "Unnamed product"),
  category: String(item.category || "Other"),
  unit: String(item.unit || "each"),
  price: Number(item.price) || 0,
  badge: String(item.badge || ""),
  image: String(item.image || ""),
  alt: String(item.alt || item.name || "Product image"),
  description: String(item.description || "")
}));

const money = n => "৳" + Number(n).toLocaleString("en-BD");
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
}[char]));

const categoryEmoji = {
  Groceries: "🥬",
  "Personal care": "🧴",
  "Home care": "🧹",
  Snacks: "🍪",
  Beverages: "🥤"
};

let activeCategory = "All", query = "", sortMode = "featured", toastTimer;
let cart = {};
try { cart = JSON.parse(localStorage.getItem("dailymart-cart") || "{}") || {}; } catch { cart = {}; }

function saveCart(){ try { localStorage.setItem("dailymart-cart", JSON.stringify(cart)); } catch {} }

function getCategories(){
  return [...new Set(products.map(product => product.category).filter(Boolean))];
}

function renderCategoryChips(){
  const allCategories = getCategories();
  $("categoryRow").innerHTML = [
    '<button class="category-chip active" data-category="All">All essentials <span>↗</span></button>',
    ...allCategories.map(category => `<button class="category-chip" data-category="${escapeHtml(category)}">${categoryEmoji[category] || "🛍️"} ${escapeHtml(category)}</button>`)
  ].join("");
}

function filteredProducts(){
  let list = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const searchText = `${product.name} ${product.category} ${product.unit} ${product.description}`.toLowerCase();
    return matchesCategory && searchText.includes(query.toLowerCase());
  });

  if (sortMode === "low") list.sort((a, b) => a.price - b.price);
  if (sortMode === "high") list.sort((a, b) => b.price - a.price);
  if (sortMode === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function bindImageFallbacks(){
  document.querySelectorAll(".product-image").forEach(image => {
    image.addEventListener("error", () => {
      const visual = image.closest(".product-visual");
      if (visual) visual.classList.add("image-fallback");
    }, { once: true });
  });
}

function renderProducts(){
  const list = filteredProducts();
  $("resultCount").textContent = query
    ? `${list.length} result${list.length === 1 ? "" : "s"} for “${query}”`
    : activeCategory === "All"
      ? "Showing all essentials"
      : `Showing ${activeCategory.toLowerCase()}`;

  $("productGrid").innerHTML = list.map(product => {
    const imageMarkup = product.image
      ? `<img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" loading="lazy">`
      : "";

    return `<article class="product-card"><div class="product-visual${product.image ? "" : " image-fallback"}" data-fallback="Image unavailable">${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ""}${imageMarkup}<button class="quick-add" data-add="${product.id}" aria-label="Add ${escapeHtml(product.name)} to cart">+</button></div><div class="product-info"><div class="product-category">${escapeHtml(product.category)}</div><h3 class="product-name">${escapeHtml(product.name)}</h3><p class="product-description">${escapeHtml(product.description)}</p><div class="product-bottom"><div class="product-price">${money(product.price)} <span class="product-unit">/ ${escapeHtml(product.unit)}</span></div><span class="rating">✳ <span>4.8</span></span></div></div></article>`;
  }).join("");

  bindImageFallbacks();
  $("emptyState").classList.toggle("hidden", list.length !== 0);
}

function cartCount(){ return Object.values(cart).reduce((sum, qty) => sum + Number(qty), 0); }
function cartTotal(){ return products.reduce((sum, product) => sum + product.price * (Number(cart[product.id]) || 0), 0); }

function renderCart(){
  const count = cartCount(), total = cartTotal();
  $("cartCount").textContent = count;
  $("drawerCount").textContent = `(${count})`;

  $("cartItems").innerHTML = products
    .filter(product => cart[product.id])
    .map(product => `<div class="cart-line"><img class="cart-thumb" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}"><div><h4>${escapeHtml(product.name)}</h4><small>${escapeHtml(product.unit)}</small><div class="line-price">${money(product.price * cart[product.id])}</div><div class="quantity-control"><button data-change="${product.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${cart[product.id]}</span><button data-change="${product.id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove-item" data-remove="${product.id}" aria-label="Remove ${escapeHtml(product.name)}">×</button></div>`)
    .join("");

  const empty = count === 0;
  $("cartEmpty").classList.toggle("hidden", !empty);
  $("cartSummary").classList.toggle("hidden", empty);
  $("subtotal").textContent = money(total);
  $("cartTotal").textContent = money(total);
  $("checkoutTotal").textContent = money(total);
}

function toast(message){
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2200);
}

function addToCart(id){ cart[id] = (Number(cart[id]) || 0) + 1; saveCart(); renderCart(); toast("Added to your cart"); }
function changeQty(id, delta){ cart[id] = (Number(cart[id]) || 0) + delta; if (cart[id] <= 0) delete cart[id]; saveCart(); renderCart(); }
function openCart(){ renderCart(); $("overlay").classList.add("open"); $("cartDrawer").classList.add("open"); $("cartDrawer").setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
function closeCart(){ $("overlay").classList.remove("open"); $("cartDrawer").classList.remove("open"); $("cartDrawer").setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
function openCheckout(){ if (cartCount() === 0) return; closeCart(); $("checkoutBackdrop").classList.add("open"); $("checkoutForm").classList.remove("hidden"); $("orderSuccess").classList.add("hidden"); $("checkoutTotal").textContent = money(cartTotal()); document.body.style.overflow = "hidden"; }
function closeCheckout(){ $("checkoutBackdrop").classList.remove("open"); document.body.style.overflow = ""; }

$("productGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

$("cartItems").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQty(Number(quantityButton.dataset.change), Number(quantityButton.dataset.delta));
  if (removeButton) { delete cart[removeButton.dataset.remove]; saveCart(); renderCart(); }
});

$("categoryRow").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".category-chip").forEach(chip => chip.classList.toggle("active", chip === button));
  renderProducts();
});

$("searchInput").addEventListener("input", event => { query = event.target.value.trim(); renderProducts(); });
$("sortSelect").addEventListener("change", event => { sortMode = event.target.value; renderProducts(); });
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
$("continueShopping").addEventListener("click", () => { closeCart(); $("shop").scrollIntoView({ behavior: "smooth" }); });
$("checkoutButton").addEventListener("click", openCheckout);
$("closeCheckout").addEventListener("click", closeCheckout);
$("checkoutBackdrop").addEventListener("click", event => { if (event.target === $("checkoutBackdrop")) closeCheckout(); });
$("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  $("checkoutForm").classList.add("hidden");
  $("orderSuccess").classList.remove("hidden");
});
$("finishOrder").addEventListener("click", () => { cart = {}; saveCart(); renderCart(); closeCheckout(); renderProducts(); toast("Thanks for trying the DailyMart demo"); });
$("accountButton").addEventListener("click", () => toast("Account sign-in is not connected in this demo"));

document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("searchInput").focus();
  }
  if (event.key === "Escape") {
    closeCart();
    closeCheckout();
  }
});

$("year").textContent = new Date().getFullYear();
renderCategoryChips();
renderProducts();
renderCart();

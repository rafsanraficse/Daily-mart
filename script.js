const products = [
 {id:1,name:"Premium Miniket Rice",category:"Groceries",unit:"1 kg",price:78,badge:"PANTRY PICK",image:"https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=85",alt:"Bowl of white rice"},
 {id:2,name:"Fresh Farm Eggs",category:"Groceries",unit:"6 pieces",price:84,badge:"DAILY FAVOURITE",image:"https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=85",alt:"Fresh eggs"},
 {id:3,name:"Whole Milk",category:"Groceries",unit:"500 ml",price:45,badge:"",image:"https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=85",alt:"Glass of fresh milk"},
 {id:4,name:"Golden Cooking Oil",category:"Groceries",unit:"1 litre",price:175,badge:"KITCHEN BASIC",image:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=85",alt:"Cooking oil"},
 {id:5,name:"Gentle Hand Wash",category:"Personal care",unit:"250 ml",price:120,badge:"GENTLE CARE",image:"https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=85",alt:"Personal care bottle"},
 {id:6,name:"Daily Shampoo",category:"Personal care",unit:"180 ml",price:155,badge:"",image:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=85",alt:"Hair care products"},
 {id:7,name:"Fresh Cotton Soap",category:"Personal care",unit:"100 g",price:55,badge:"EVERYDAY PICK",image:"https://images.unsplash.com/photo-1600428853876-fb5a850b444f?auto=format&fit=crop&w=600&q=85",alt:"Bar soap"},
 {id:8,name:"Home Cleaning Spray",category:"Home care",unit:"500 ml",price:135,badge:"HOME HERO",image:"https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=85",alt:"Household cleaning products"},
 {id:9,name:"Dishwashing Liquid",category:"Home care",unit:"500 ml",price:95,badge:"",image:"https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=85",alt:"Cleaning supplies"},
 {id:10,name:"Classic Tea Biscuits",category:"Snacks",unit:"pack",price:35,badge:"TEA TIME",image:"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=85",alt:"Biscuits and cookies"},
 {id:11,name:"Roasted Peanut Mix",category:"Snacks",unit:"150 g",price:65,badge:"",image:"https://images.unsplash.com/photo-1567892737950-30c4db37cd89?auto=format&fit=crop&w=600&q=85",alt:"Snack mix"},
 {id:12,name:"Orange Juice",category:"Groceries",unit:"1 litre",price:130,badge:"FRUITY PICK",image:"https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=85",alt:"Orange juice"}
];
const money = n => "৳" + Number(n).toLocaleString("en-BD");
const $ = id => document.getElementById(id);
let activeCategory = "All", query = "", sortMode = "featured", toastTimer;
let cart = {};
try { cart = JSON.parse(localStorage.getItem("dailymart-cart") || "{}") || {}; } catch { cart = {}; }

function saveCart(){ try { localStorage.setItem("dailymart-cart", JSON.stringify(cart)); } catch {} }
function filteredProducts(){
 let list = products.filter(p => (activeCategory === "All" || p.category === activeCategory) && (p.name+" "+p.category+" "+p.unit).toLowerCase().includes(query.toLowerCase()));
 if(sortMode==="low") list.sort((a,b)=>a.price-b.price);
 if(sortMode==="high") list.sort((a,b)=>b.price-a.price);
 if(sortMode==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
 return list;
}
function renderProducts(){
 const list = filteredProducts();
 $("resultCount").textContent = query ? `${list.length} result${list.length===1?"":"s"} for “${query}”` : activeCategory==="All" ? "Showing all essentials" : `Showing ${activeCategory.toLowerCase()}`;
 $("productGrid").innerHTML = list.map(p=>`<article class="product-card"><div class="product-visual">${p.badge?`<span class="product-badge">${p.badge}</span>`:""}<img src="${p.image}" alt="${p.alt}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')"><button class="quick-add" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div><div class="product-info"><div class="product-category">${p.category}</div><h3 class="product-name">${p.name}</h3><div class="product-bottom"><div class="product-price">${money(p.price)} <span class="product-unit">/ ${p.unit}</span></div><span class="rating">✳ <span>4.8</span></span></div></div></article>`).join("");
 $("emptyState").classList.toggle("hidden",list.length!==0);
}
function cartCount(){return Object.values(cart).reduce((s,n)=>s+Number(n),0)}
function cartTotal(){return products.reduce((s,p)=>s+p.price*(Number(cart[p.id])||0),0)}
function renderCart(){
 const count=cartCount(), total=cartTotal();
 $("cartCount").textContent=count; $("drawerCount").textContent=`(${count})`;
 $("cartItems").innerHTML=products.filter(p=>cart[p.id]).map(p=>`<div class="cart-line"><img class="cart-thumb" src="${p.image}" alt=""><div><h4>${p.name}</h4><small>${p.unit}</small><div class="line-price">${money(p.price*cart[p.id])}</div><div class="quantity-control"><button data-change="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${cart[p.id]}</span><button data-change="${p.id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove-item" data-remove="${p.id}" aria-label="Remove ${p.name}">×</button></div>`).join("");
 const empty=count===0; $("cartEmpty").classList.toggle("hidden",!empty); $("cartSummary").classList.toggle("hidden",empty);
 $("subtotal").textContent=money(total); $("cartTotal").textContent=money(total); $("checkoutTotal").textContent=money(total);
}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200)}
function addToCart(id){cart[id]=(Number(cart[id])||0)+1;saveCart();renderCart();toast("Added to your cart")}
function changeQty(id,delta){cart[id]=(Number(cart[id])||0)+delta;if(cart[id]<=0)delete cart[id];saveCart();renderCart()}
function openCart(){renderCart();$("overlay").classList.add("open");$("cartDrawer").classList.add("open");$("cartDrawer").setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeCart(){$("overlay").classList.remove("open");$("cartDrawer").classList.remove("open");$("cartDrawer").setAttribute("aria-hidden","true");document.body.style.overflow=""}
function openCheckout(){if(cartCount()===0)return;closeCart();$("checkoutBackdrop").classList.add("open");$("checkoutForm").classList.remove("hidden");$("orderSuccess").classList.add("hidden");$("checkoutTotal").textContent=money(cartTotal());document.body.style.overflow="hidden"}
function closeCheckout(){$("checkoutBackdrop").classList.remove("open");document.body.style.overflow=""}
$("productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(Number(b.dataset.add))});
$("cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-change]"),r=e.target.closest("[data-remove]");if(q)changeQty(Number(q.dataset.change),Number(q.dataset.delta));if(r) {delete cart[r.dataset.remove];saveCart();renderCart()}});
$("categoryRow").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".category-chip").forEach(c=>c.classList.toggle("active",c===b));renderProducts()});
$("searchInput").addEventListener("input",e=>{query=e.target.value.trim();renderProducts()});
$("sortSelect").addEventListener("change",e=>{sortMode=e.target.value;renderProducts()});
$("clearFilters").addEventListener("click",()=>{activeCategory="All";query="";$("searchInput").value="";document.querySelectorAll(".category-chip").forEach(c=>c.classList.toggle("active",c.dataset.category==="All"));renderProducts()});
$("openCart").addEventListener("click",openCart);$("closeCart").addEventListener("click",closeCart);$("overlay").addEventListener("click",closeCart);$("continueShopping").addEventListener("click",()=>{closeCart();$("shop").scrollIntoView({behavior:"smooth"})});
$("checkoutButton").addEventListener("click",openCheckout);$("closeCheckout").addEventListener("click",closeCheckout);
$("checkoutBackdrop").addEventListener("click",e=>{if(e.target===$("checkoutBackdrop"))closeCheckout()});
$("checkoutForm").addEventListener("submit",e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;$("checkoutForm").classList.add("hidden");$("orderSuccess").classList.remove("hidden")});
$("finishOrder").addEventListener("click",()=>{cart={};saveCart();renderCart();closeCheckout();renderProducts();toast("Thanks for trying the DailyMart demo")});
$("accountButton").addEventListener("click",()=>toast("Account sign-in is not connected in this demo"));
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("searchInput").focus()}if(e.key==="Escape"){closeCart();closeCheckout()}});
$("year").textContent=new Date().getFullYear();
renderProducts();renderCart();

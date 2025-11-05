// Lumora mini-site JS (cart, rendering, checkout)
const PRODUCTS = [
  {
    id: "rose-romance",
    name: "Rose Romance",
    price: 42.00,
    image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1200&auto=format&fit=crop",
    badges: ["Stress‑relief", "Soy & coconut", "Reusable jar"],
    description: "A rich rose blend with soft vanilla undertones for evening calm.",
    variants: ["Standard 220g", "Large 400g"]
  },
  {
    id: "lavender-serenity",
    name: "Lavender Serenity",
    price: 39.00,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
    badges: ["Sleep support", "Organic wick", "Long burn"],
    description: "Classic lavender crafted for deep relaxation and night rituals.",
    variants: ["Standard 220g", "Large 400g"]
  },
  {
    id: "jasmine-harmony",
    name: "Jasmine Harmony",
    price: 41.00,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    badges: ["Uplifting", "Eco packaging", "Mix & match"],
    description: "Bright jasmine with citrus hints for daytime focus and calm.",
    variants: ["Standard 220g", "Large 400g"]
  }
];

const format = (n)=> `$${n.toFixed(2)}`;
const byId = (id)=> PRODUCTS.find(p=>p.id===id);

// CART state in localStorage
const CART_KEY = "lumora_cart";
const getCart = ()=> JSON.parse(localStorage.getItem(CART_KEY) || "[]");
const setCart = (items)=> localStorage.setItem(CART_KEY, JSON.stringify(items));
const addToCart = (id, qty=1, variant="Standard 220g") => {
  const cart = getCart();
  const idx = cart.findIndex(i=> i.id===id && i.variant===variant);
  if(idx>-1){ cart[idx].qty += qty; } else { cart.push({id, qty, variant}); }
  setCart(cart); updateCartCount();
};

function updateCartCount(){
  const el = document.getElementById("cartCount");
  if(!el) return;
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  el.textContent = count;
}

function renderProducts(){
  const grid = document.getElementById("productGrid");
  if(!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card product-card">
      <img src="${p.image}" alt="${p.name} candle" loading="lazy"/>
      <h3>${p.name}</h3>
      <p class="muted small">${p.description}</p>
      <div class="price">${format(p.price)}</div>
      <div class="actions">
        <a class="btn" href="product.html?id=${p.id}">View</a>
        <button class="btn btn--ghost" onclick="addToCart('${p.id}',1)">Add</button>
      </div>
    </article>
  `).join("");
}

function renderProductDetail(){
  const container = document.getElementById("productDetail");
  if(!container) return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "rose-romance";
  const product = byId(id) || PRODUCTS[0];

  let activeVariant = product.variants[0];
  container.innerHTML = `
    <div>
      <img src="${product.image}" alt="${product.name} candle"/>
    </div>
    <div>
      <h1>${product.name}</h1>
      <div class="badges">${product.badges.map(b=>`<span class="badge">${b}</span>`).join("")}</div>
      <p class="muted">${product.description}</p>
      <div class="price">${format(product.price)}</div>
      <div class="variant" id="variantRow">
        ${product.variants.map(v=>`<button data-v="${v}" class="${v===activeVariant?'active':''}">${v}</button>`).join("")}
      </div>
      <div class="actions">
        <button class="btn" id="addBtn">Add to cart</button>
        <a class="btn btn--ghost" href="cart.html">Go to cart</a>
      </div>
    </div>
  `;

  const variantRow = document.getElementById("variantRow");
  variantRow.addEventListener("click", (e)=>{
    if(e.target.tagName==="BUTTON"){
      activeVariant = e.target.dataset.v;
      [...variantRow.querySelectorAll("button")].forEach(b=>b.classList.remove("active"));
      e.target.classList.add("active");
    }
  });

  document.getElementById("addBtn").addEventListener("click", ()=>{
    addToCart(product.id, 1, activeVariant);
    alert("Added to cart.");
  });
}

function renderCart(){
  const list = document.getElementById("cartItems");
  if(!list) return;
  const items = getCart();
  if(items.length===0){ list.innerHTML = '<p class="muted">Your cart is empty.</p>'; updateSummary(); return; }
  list.innerHTML = items.map((i,idx)=>{
    const p = byId(i.id);
    return `
      <div class="cart-row">
        <img src="${p.image}" alt="${p.name}"/>
        <div>
          <div><strong>${p.name}</strong></div>
          <div class="muted small">${i.variant}</div>
        </div>
        <div class="price">${format(p.price)}</div>
        <div class="qty">
          <button aria-label="decrease" onclick="changeQty(${idx},-1)">–</button>
          <span>${i.qty}</span>
          <button aria-label="increase" onclick="changeQty(${idx},1)">+</button>
        </div>
        <button class="remove" onclick="removeItem(${idx})">Remove</button>
      </div>
    `;
  }).join("");
  updateSummary();
}

function changeQty(index, delta){
  const cart = getCart();
  cart[index].qty += delta;
  if(cart[index].qty<=0) cart.splice(index,1);
  setCart(cart); renderCart(); updateCartCount();
}

function removeItem(index){
  const cart = getCart();
  cart.splice(index,1);
  setCart(cart); renderCart(); updateCartCount();
}

function updateSummary(){
  const items = getCart();
  const subtotal = items.reduce((s,i)=> s + byId(i.id).price * i.qty, 0);
  const code = (document.getElementById("coupon") || {value:""}).value.trim().toUpperCase();
  let discount = 0;
  if(code==="STUDENT10" || code==="WELCOME10"){ discount = subtotal * 0.10; }
  let shipping = 10;
  if(subtotal - discount >= 80 || subtotal===0) shipping = 0;
  const total = Math.max(subtotal - discount, 0) + shipping;

  const fmt = (id, val)=>{ const el = document.getElementById(id); if(el) el.textContent = `$${val.toFixed(2)}`; };
  fmt("subtotal", subtotal); fmt("discount", discount); fmt("shipping", shipping); fmt("total", total);
}

function initCheckout(){
  const form = document.getElementById("checkoutForm");
  if(!form) return;
  form.addEventListener("input", updateSummary);
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const order = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      coupon: document.getElementById("coupon").value.trim().toUpperCase(),
      items: getCart(),
      createdAt: new Date().toISOString()
    };
    document.getElementById("orderMsg").textContent = "Order placed! (demo) — check your inbox for a confirmation.";
    setCart([]); updateCartCount(); renderCart(); updateSummary();
    console.log("Demo order:", order);
  });
  updateSummary();
}

function initYear(){ const y = document.getElementById("year"); if(y) y.textContent = new Date().getFullYear(); }

document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  renderProducts();
  renderProductDetail();
  renderCart();
  initCheckout();
  initYear();
});

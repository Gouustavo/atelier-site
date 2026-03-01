// ===============================
// DADOS (VOCÊ EDITA AQUI)
// ===============================
const PRODUCTS = [
  {
    id: "Caveira com Cigarro Aceso",
    title: "Caveira com Cigarro Aceso",
    price: 430,
    category: "acrilica", // oleo | acrilica | desenho | etc
    technique: "Acrílica",
    size: "27x35 cm + moldura: 32x40 cm",
    year: 2020,
    featured: true,
    available: true,
    images: ["img/cavera1.jpeg", "img/cavera2.jpeg", "img/cavera3.jpeg"],

    description: "Descrição do quadro. Troque pelo seu texto."
  },
  {
    id: "a Jovem e a Pera",
    title: "a Jovem e a Pera",
    price: 450,
    category: "oleo",
    technique: "Óleo sobre tela",
    size: "27x35 cm",
    year: 2025,
    featured: true,
    available: true,
    images: ["img/b3.jpeg", "img/b2.jpeg", "img/b1.jpeg"],
    description: "Descrição do quadro. Troque pelo seu texto."
  },
  {
    id: "Amendoreira em Flor num copo",
    title: "Amendoeira em Flor num copo",
    price: 250,
    category: "oleo",
    technique: "Óleo sobre tela",
    size: "20x35 cm",
    year: 2021,
    featured: true,
    available: true,
    images: ["img/amendoeira1.jpeg", "img/amendoeira2.jpeg", "img/amendoeira3.jpeg"],
    description: "Descrição do quadro. Troque pelo seu texto."
  }
];

// Contatos (troque depois)
const CONTACT = {
  whatsappNumber: "55 12 99650-3453", // DDI+DDD+número (só números)
  instagramUrl: "https://www.instagram.com/_gou.arts/",
  email: "gustavomif013@gmail.com"
};

// ===============================
// UTIL
// ===============================
const fmtBRL = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const $ = (sel) => document.querySelector(sel);

function safeText(text) {
  return (text ?? "").toString();
}

// ===============================
// ELEMENTOS
// ===============================
const grid = $("#productsGrid");
const emptyState = $("#emptyState");
const searchInput = $("#searchInput");
const categorySelect = $("#categorySelect");
const sortSelect = $("#sortSelect");
const resetFiltersBtn = $("#resetFiltersBtn");

const modal = $("#productModal");
const modalTitle = $("#modalTitle");
const modalMeta = $("#modalMeta");
const modalDesc = $("#modalDesc");
const modalPrice = $("#modalPrice");
const modalAvailability = $("#modalAvailability");
const addToCartBtn = $("#addToCartBtn");
const copyInfoBtn = $("#copyInfoBtn");
const copyMsg = $("#copyMsg");

// Slider elements
const sliderTrack = $("#sliderTrack");
const sliderDots = $("#sliderDots");
const prevImg = $("#prevImg");
const nextImg = $("#nextImg");
const sliderViewport = $("#sliderViewport");

const cartDrawer = $("#cartDrawer");
const openCartBtn = $("#openCartBtn");
const closeCartBtn = $("#closeCartBtn");
const drawerBackdrop = $("#drawerBackdrop");
const cartItemsEl = $("#cartItems");
const cartTotalEl = $("#cartTotal");
const cartCountEl = $("#cartCount");
const clearCartBtn = $("#clearCartBtn");
const checkoutBtn = $("#checkoutBtn");

const leadForm = $("#leadForm");
const formMsg = $("#formMsg");

let currentModalProduct = null;

// slider state
let sliderIndex = 0;
let sliderImages = [];

// ===============================
// CARRINHO (LOCALSTORAGE)
// ===============================
const CART_KEY = "atelier_cart_v1";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId) {
  const cart = loadCart();
  const idx = cart.findIndex((i) => i.id === productId);
  if (idx >= 0) cart[idx].qty += 1;
  else cart.push({ id: productId, qty: 1 });

  saveCart(cart);
  renderCart();
  bumpCartBadge();
  showToast("Adicionado ao carrinho!");
}

function removeFromCart(productId) {
  const cart = loadCart().filter((i) => i.id !== productId);
  saveCart(cart);
  renderCart();
  bumpCartBadge();
}

function setQty(productId, qty) {
  const cart = loadCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.qty = Math.max(1, Math.min(99, qty));
  saveCart(cart);
  renderCart();
  bumpCartBadge();
}

function cartCount() {
  return loadCart().reduce((acc, i) => acc + i.qty, 0);
}

function cartTotal() {
  const cart = loadCart();
  return cart.reduce((acc, item) => {
    const p = PRODUCTS.find((x) => x.id === item.id);
    if (!p) return acc;
    return acc + p.price * item.qty;
  }, 0);
}

function bumpCartBadge() {
  cartCountEl.textContent = cartCount().toString();
}

// ===============================
// SLIDER (mais fotos do mesmo quadro)
// ===============================
function renderSlider(images) {
  sliderImages = images?.length ? images : [];
  sliderIndex = 0;

  if (sliderImages.length === 0) {
    sliderTrack.innerHTML = `
      <div class="slider__slide">
        <div class="modal__placeholder">Coloque fotos deste quadro aqui</div>
      </div>
    `;
    sliderDots.innerHTML = "";
    prevImg.style.display = "none";
    nextImg.style.display = "none";
    updateSlider();
    return;
  }

  sliderTrack.innerHTML = sliderImages.map((src, i) => `
    <div class="slider__slide">
      <img src="${src}" alt="${safeText(currentModalProduct?.title || "Quadro")} — foto ${i + 1}" loading="lazy" />
    </div>
  `).join("");

  sliderDots.innerHTML = sliderImages.map((_, i) => `
    <button class="slider__dot ${i === 0 ? "is-active" : ""}" type="button" data-dot="${i}" aria-label="Ir para foto ${i + 1}"></button>
  `).join("");

  prevImg.style.display = sliderImages.length > 1 ? "grid" : "none";
  nextImg.style.display = sliderImages.length > 1 ? "grid" : "none";

  updateSlider();
}

function updateSlider() {
  sliderTrack.style.transform = `translateX(-${sliderIndex * 100}%)`;
  sliderDots.querySelectorAll(".slider__dot").forEach((dot) => {
    dot.classList.toggle("is-active", Number(dot.dataset.dot) === sliderIndex);
  });
}

function goToSlide(i) {
  if (!sliderImages.length) return;
  sliderIndex = Math.max(0, Math.min(sliderImages.length - 1, i));
  updateSlider();
}

// eventos do slider
prevImg.addEventListener("click", () => goToSlide(sliderIndex - 1));
nextImg.addEventListener("click", () => goToSlide(sliderIndex + 1));

sliderDots.addEventListener("click", (e) => {
  const btn = e.target.closest(".slider__dot");
  if (!btn) return;
  goToSlide(Number(btn.dataset.dot));
});

// Arrastar (swipe) no mouse/celular
let startX = null;
sliderViewport.addEventListener("pointerdown", (e) => { startX = e.clientX; });
sliderViewport.addEventListener("pointerup", (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  startX = null;

  if (Math.abs(dx) < 35) return;
  if (dx < 0) goToSlide(sliderIndex + 1);
  else goToSlide(sliderIndex - 1);
});

// Teclas (← →) quando o modal estiver aberto
window.addEventListener("keydown", (e) => {
  if (!modal.open) return;
  if (e.key === "ArrowLeft") goToSlide(sliderIndex - 1);
  if (e.key === "ArrowRight") goToSlide(sliderIndex + 1);
});

// ===============================
// RENDER PRODUTOS
// ===============================
function getFilteredProducts() {
  const q = safeText(searchInput.value).trim().toLowerCase();
  const cat = categorySelect.value;
  const sort = sortSelect.value;

  let list = [...PRODUCTS];

  if (cat !== "all") list = list.filter((p) => p.category === cat);

  if (q) {
    list = list.filter((p) => {
      const hay = `${p.title} ${p.technique} ${p.size} ${p.category} ${p.description}`.toLowerCase();
      return hay.includes(q);
    });
  }

  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      break;
    case "featured":
    default:
      list.sort((a, b) => (b.featured === true) - (a.featured === true));
      break;
  }

  return list;
}

function productCardHTML(p) {
  const cover = (p.images && p.images[0]) ? p.images[0] : "";
  const badge = p.available ? "Disponível" : "Vendido";
  const tag = p.technique || "Quadro";

  return `
    <article class="card" data-id="${p.id}">
      <div class="card__imgWrap">
        ${
          cover
            ? `<div class="card__img"><img src="${cover}" alt="${safeText(p.title)}" loading="lazy"/></div>`
            : `<div class="card__img">Coloque a foto do quadro aqui</div>`
        }
      </div>
      <div class="card__body">
        <div class="card__top">
          <div>
            <div class="card__title">${safeText(p.title)}</div>
            <div class="card__meta">${safeText(p.size)} • ${safeText(p.year)}</div>
          </div>
          <div class="price">${fmtBRL(p.price)}</div>
        </div>
        <div class="tag">${safeText(tag)} • ${badge}</div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const list = getFilteredProducts();
  grid.innerHTML = list.map(productCardHTML).join("");

  emptyState.hidden = list.length > 0;

  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      const p = PRODUCTS.find((x) => x.id === id);
      if (p) openProductModal(p);
    });
  });
}

// ===============================
// MODAL
// ===============================
function openProductModal(p) {
  currentModalProduct = p;

  modalTitle.textContent = p.title;
  modalMeta.textContent = `${p.technique} • ${p.size} • ${p.year}`;
  modalDesc.textContent = p.description;

  modalPrice.textContent = fmtBRL(p.price);
  modalAvailability.textContent = p.available ? "Disponível" : "Vendido";

  addToCartBtn.disabled = !p.available;

  renderSlider(p.images || []);

  copyMsg.textContent = "";
  modal.showModal();
}

addToCartBtn.addEventListener("click", () => {
  if (!currentModalProduct?.available) return;
  addToCart(currentModalProduct.id);
});

copyInfoBtn.addEventListener("click", async () => {
  if (!currentModalProduct) return;

  const p = currentModalProduct;
  const text =
`Quadro: ${p.title}
Técnica: ${p.technique}
Tamanho: ${p.size}
Ano: ${p.year}
Preço: ${fmtBRL(p.price)}
Status: ${p.available ? "Disponível" : "Vendido"}
ID: ${p.id}`;

  try {
    await navigator.clipboard.writeText(text);
    copyMsg.textContent = "Infos copiadas!";
  } catch {
    copyMsg.textContent = "Não consegui copiar automaticamente. Se quiser, seleciona e copia manualmente.";
  }
});

// ===============================
// CARRINHO UI
// ===============================
function openDrawer() {
  cartDrawer.classList.add("drawer--open");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeDrawer() {
  cartDrawer.classList.remove("drawer--open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

openCartBtn.addEventListener("click", () => { renderCart(); openDrawer(); });
closeCartBtn.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

function renderCart() {
  const cart = loadCart();
  bumpCartBadge();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="muted">Seu carrinho está vazio.</p>`;
    cartTotalEl.textContent = fmtBRL(0);
    return;
  }

  const rows = cart.map((item) => {
    const p = PRODUCTS.find((x) => x.id === item.id);
    if (!p) return "";

    return `
      <div class="cart-item">
        <div class="cart-item__info">
          <strong>${safeText(p.title)}</strong>
          <div class="muted tiny">${safeText(p.technique)} • ${safeText(p.size)}</div>
          <div class="muted tiny">Unitário: ${fmtBRL(p.price)}</div>
        </div>

        <div class="cart-item__controls">
          <button class="mini" data-action="dec" data-id="${p.id}">−</button>
          <input class="qty" value="${item.qty}" inputmode="numeric" data-action="qty" data-id="${p.id}" />
          <button class="mini" data-action="inc" data-id="${p.id}">+</button>
          <button class="mini mini--danger" data-action="remove" data-id="${p.id}">Remover</button>
        </div>
      </div>
    `;
  }).join("");

  cartItemsEl.innerHTML = rows;
  cartTotalEl.textContent = fmtBRL(cartTotal());

  cartItemsEl.querySelectorAll("[data-action]").forEach((el) => {
    const action = el.getAttribute("data-action");
    const id = el.getAttribute("data-id");

    if (action === "inc") el.addEventListener("click", () => setQty(id, (loadCart().find(i=>i.id===id)?.qty ?? 1) + 1));
    if (action === "dec") el.addEventListener("click", () => setQty(id, (loadCart().find(i=>i.id===id)?.qty ?? 1) - 1));
    if (action === "remove") el.addEventListener("click", () => removeFromCart(id));
    if (action === "qty") {
      el.addEventListener("change", (e) => {
        const v = parseInt(e.target.value, 10);
        if (!Number.isFinite(v)) return;
        setQty(id, v);
      });
    }
  });
}

clearCartBtn.addEventListener("click", () => {
  saveCart([]);
  renderCart();
  bumpCartBadge();
});

checkoutBtn.addEventListener("click", () => {
  const cart = loadCart();
  if (cart.length === 0) {
    closeDrawer();
    showToast("Seu carrinho está vazio.");
    location.hash = "#galeria";
    return;
  }

  // vai para a tela de pagamento/resumo
  closeDrawer();
  window.location.href = "pagamento.html";
});

// ===============================
// FORM / CONTATO
// ===============================
function setContactLinks() {
  const whats = document.querySelector("#whatsLink");
  const insta = document.querySelector("#instaLink");

  const preMsg = encodeURIComponent("Olá! Tenho interesse em um quadro do seu ateliê.");
  const phone = digitsOnly(CONTACT.whatsappNumber);
  if (whats) whats.href = `https://wa.me/${phone}?text=${preMsg}`;
  insta.href = CONTACT.instagramUrl;
}

leadForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(leadForm);
  const name = safeText(data.get("name"));
  const contact = safeText(data.get("contact"));
  const message = safeText(data.get("message"));

  const text =
`Nome: ${name}
Contato: ${contact}

Mensagem:
${message}`;

  const phone = digitsOnly(CONTACT.whatsappNumber);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");

  formMsg.textContent = "Abrindo WhatsApp com sua mensagem…";
  leadForm.reset();
});

// ===============================
// EXTRAS UI
// ===============================
function injectCartStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .drawer{ position:fixed; inset:0; pointer-events:none; z-index:50; }
    /* IMPORTANTE: o backdrop NÃO pode ficar por cima do painel (senão os botões não clicam) */
    .drawer__backdrop{ position:absolute; inset:0; background: rgba(0,0,0,.55); opacity:0; transition: opacity .2s ease; z-index: 1; }
    .drawer__panel{
      position:absolute; right:0; top:0; height:100%;
      width:min(420px, 92vw);
      border-left:1px solid var(--line);
      background: rgba(18,20,26,.96);
      transform: translateX(110%);
      transition: transform .25s ease;
      display:flex; flex-direction:column;
      box-shadow: var(--shadow);
      z-index: 2;
    }
    .drawer--open{ pointer-events:auto; }
    .drawer--open .drawer__panel{ transform: translateX(0); }
    .drawer--open .drawer__backdrop{ opacity:1; }
    .drawer__head{ display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid var(--line); }
    .drawer__body{ padding:16px; overflow:auto; display:grid; gap:12px; }
    .drawer__foot{ padding:16px; border-top:1px solid var(--line); display:grid; gap:10px; }
    .drawer__close{ background: rgba(255,255,255,.06); border:1px solid var(--line); color:var(--text); border-radius:999px; width:38px; height:38px; cursor:pointer; }
    .totals{ display:flex; align-items:center; justify-content:space-between; }
    .cart-item{ border:1px solid var(--line); background: rgba(255,255,255,.03); border-radius: 16px; padding:12px; display:grid; gap:10px; }
    .cart-item__controls{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
    .mini{ border:1px solid var(--line); background: rgba(255,255,255,.03); color:var(--text); border-radius: 12px; padding:8px 10px; cursor:pointer; }
    .mini:hover{ background: rgba(255,255,255,.06); }
    .mini--danger{ border-color: rgba(255,120,120,.22); }
    .qty{ width:60px; text-align:center; }
  `;
  document.head.appendChild(style);
}

// só números (wa.me exige isso)
function digitsOnly(value) {
  return safeText(value).replace(/\D+/g, "");
}

// Toast simples ("adicionado ao carrinho")
let toastEl = null;
function showToast(message) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.style.cssText = [
      "position:fixed",
      "left:50%",
      "bottom:18px",
      "transform:translateX(-50%)",
      "background:rgba(18,20,26,.95)",
      "border:1px solid rgba(255,255,255,.10)",
      "color:#eaeaf0",
      "padding:10px 14px",
      "border-radius:14px",
      "box-shadow: 0 18px 60px rgba(0,0,0,.55)",
      "z-index:9999",
      "opacity:0",
      "transition:opacity .2s ease"
    ].join(";");
    document.body.appendChild(toastEl);
  }

  toastEl.textContent = message;
  toastEl.style.opacity = "1";
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    if (toastEl) toastEl.style.opacity = "0";
  }, 1600);
}

function wireFilters() {
  const rerender = () => renderProducts();

  searchInput.addEventListener("input", rerender);
  categorySelect.addEventListener("change", rerender);
  sortSelect.addEventListener("change", rerender);

  resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    categorySelect.value = "all";
    sortSelect.value = "featured";
    renderProducts();
  });
}

function init() {
  document.querySelector("#year").textContent = new Date().getFullYear().toString();
  document.querySelector("#backToTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  setContactLinks();
  injectCartStyles();
  wireFilters();
  renderProducts();
  renderCart();
  bumpCartBadge();
}

init();

// ---- Patch: salvar titulo e preco no carrinho para pagina de pagamento ----
(function(){
  const KEY='atelier_cart_v1';
  const oldAdd=window.addToCart;
  window.addToCart=function(productId){
    try{
      const p=(window.PRODUCTS||[]).find(x=>x.id===productId)||{};
      const cart=JSON.parse(localStorage.getItem(KEY)||'[]');
      const idx=cart.findIndex(i=>i.id===productId);
      if(idx>=0){
        cart[idx].qty+=1;
        cart[idx].title=p.title||cart[idx].title||productId;
        cart[idx].price=p.price||cart[idx].price||0;
      }else{
        cart.push({id:productId,qty:1,title:p.title||productId,price:p.price||0});
      }
      localStorage.setItem(KEY,JSON.stringify(cart));
      if(typeof window.renderCart==='function') window.renderCart();
      if(typeof window.bumpCartBadge==='function') window.bumpCartBadge();
      if(typeof window.showToast==='function') window.showToast('Adicionado ao carrinho!');
    }catch(e){ if(oldAdd) oldAdd(productId); }
  };
})();

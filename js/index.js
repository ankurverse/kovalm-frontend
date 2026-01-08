let token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let allProducts = [];
let selectedCategory = "all";
let isFirstLoad = true;

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  try {
    if (isFirstLoad) showLoading();

    const res = await fetch(`${API_BASE}/products`);
    allProducts = await res.json();

    applyFilters();

    if (isFirstLoad) {
      hideLoading();
      isFirstLoad = false;
    }
  } catch (err) {
    console.error("Failed to load products", err);
    if (isFirstLoad) hideLoading();
  }
}

// ================= FILTER LOGIC =================
function setCategory(cat) {
  selectedCategory = cat;
  highlightCategoryButton(cat);
  applyFilters();
}


function applyFilters() {
  const searchText = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  const filtered = allProducts.filter(p => {
    const matchCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    const matchSearch =
      p.name.toLowerCase().includes(searchText) ||
      (p.description || "").toLowerCase().includes(searchText);

    return matchCategory && matchSearch;
  });

  renderProducts(filtered);
}

// ================= RENDER =================
function renderProducts(products) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  products.forEach(p => {
    const inCart = cart.find(i => i._id === p._id);
    const qtyInCart = inCart ? inCart.qty : 0;
    const remaining = p.quantity - qtyInCart;

    container.innerHTML += `
      <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-yellow-400 glow">
        <img src="${p.image}" class="h-28 w-full object-cover">

        <div class="p-3">
          <h2 class="text-sm sm:text-base font-semibold">${p.name}</h2>
          <p class="text-gray-400 text-sm">${p.description || ""}</p>

          <p class="text-xs mt-1 ${
            p.quantity > 0 ? "text-yellow-400" : "text-red-400"
          }">
            ${
              p.quantity > 0
                ? `Only ${remaining} left`
                : "Out of stock"
            }
          </p>

          <div class="flex justify-between items-center mt-2">
            <span class="text-yellow-400 font-bold">₹${p.price}</span>

            ${
              p.quantity <= 0
                ? `<span class="bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm font-bold">
                    Unavailable
                   </span>`
                : qtyInCart > 0
                ? `
                  <div class="flex items-center gap-2">
                    <button onclick="decrease('${p._id}')" class="bg-red-500 px-2 rounded">−</button>
                    <span class="text-lg">${qtyInCart}</span>
                    <button 
                      onclick="increase('${p._id}')"
                      class="bg-green-500 px-2 rounded"
                      ${qtyInCart >= p.quantity ? "disabled" : ""}>
                      +
                    </button>
                  </div>
                `
                : `
                  <button
                    onclick="addToCart('${p._id}')"
                    class="bg-yellow-400 text-black font-bold px-3 py-1 rounded">
                    Add +
                  </button>
                `
            }
          </div>
        </div>
      </div>
    `;
  });

  updateCartBar();
}


// ================= CART =================
function addToCart(id) {
  const product = allProducts.find(p => p._id === id);
  if (!product || product.quantity <= 0) return;

  const existing = cart.find(i => i._id === id);

  if (existing) {
    if (existing.qty >= product.quantity) {
      alert(`Only ${product.quantity} available`);
      return;
    }
    existing.qty++;
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      qty: 1,
      quantity: product.quantity
    });
  }

  saveCart();
  applyFilters();
}



function increase(id) {
  const item = cart.find(i => i._id === id);
  const product = allProducts.find(p => p._id === id);

  if (item.qty >= product.quantity) {
    alert(`Only ${product.quantity} available`);
    return;
  }

  item.qty++;
  saveCart();
  applyFilters();
}


function decrease(id) {
  const item = cart.find(i => i._id === id);
  item.qty--;
  if (item.qty <= 0) {
    cart = cart.filter(i => i._id !== id);
  }
  saveCart();
  applyFilters();
}

function updateCartBar() {
  const bar = document.getElementById("cartBar");
  const count = document.getElementById("cartCount");

  if (cart.length === 0) {
    bar.classList.add("hidden");
  } else {
    bar.classList.remove("hidden");
    count.innerText = `${cart.reduce((s,i)=>s+i.qty,0)} items added`;

  }
}



// ================= START =================
loadProducts();

loadPromotions();


// 🔄 Silent background refresh
setInterval(loadProducts, 5000);

// 🔔 Subscribe user for push notifications
subscribeForPush();



function highlightCategoryButton(activeCategory) {
  const buttons = document.querySelectorAll(".category-btn");

  buttons.forEach(btn => {
    const cat = btn.getAttribute("data-category");

    if (cat === activeCategory) {
      btn.classList.remove("bg-gray-700");
      btn.classList.add("bg-yellow-400", "text-black", "font-bold");
    } else {
      btn.classList.remove("bg-yellow-400", "text-black", "font-bold");
      btn.classList.add("bg-gray-700");
    }
  });
}


async function loadPromotions() {
  const res = await fetch(`${API_BASE}/promotions`);
  const promos = await res.json();

  if (promos.length === 0) return;

  document.getElementById("promoSection").classList.remove("hidden");

  const box = document.getElementById("promoContainer");
  box.innerHTML = "";

  promos.forEach(p => {
    box.innerHTML += `
      <img
        src="${p.image}"
        class="h-28 rounded-xl shadow-lg object-cover min-w-[260px]"
      />
    `;
  });
}




async function subscribeForPush() {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;

  const existingSub = await registration.pushManager.getSubscription();
  if (existingSub) return; // already subscribed

  const response = await fetch(`${API_BASE}/notifications/public-key`);
  const { publicKey } = await response.json();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  await fetch(`${API_BASE}/notifications/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription)
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

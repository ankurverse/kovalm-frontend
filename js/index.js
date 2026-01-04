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
    p.qty = inCart ? inCart.qty : 0;

    container.innerHTML += `
      <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-yellow-400 glow">
        <img src="${p.image}" class="h-28 w-full object-cover">

        <div class="p-3">
          <h2 class="font-bold text-lg">${p.name}</h2>
          <p class="text-gray-400 text-sm">${p.description || ""}</p>

          <div class="flex justify-between items-center mt-2">
            <span class="text-yellow-400 font-bold">₹${p.price}</span>

            ${
              !p.available
                ? `<span class="bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm font-bold">
                     Unavailable
                   </span>`
                : p.qty
                ? `
                  <div class="flex items-center gap-2">
                    <button onclick="decrease('${p._id}')" class="bg-red-500 px-2 rounded">−</button>
                    <span class="text-lg">${p.qty}</span>
                    <button onclick="increase('${p._id}')" class="bg-green-500 px-2 rounded">+</button>
                  </div>
                `
                : `
                  <button onclick="addToCart('${p._id}','${p.name}',${p.price},${p.available})"
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
function addToCart(id, name, price, available) {
  if (!available) {
    alert("This item is currently unavailable");
    return;
  }

  cart.push({ _id: id, name, price, qty: 1 });
  saveCart();
  showToast("Added to cart");
  applyFilters();
}

function increase(id) {
  const item = cart.find(i => i._id === id);
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
    count.innerText = `${cart.length} items added`;
  }
}

// ================= START =================
loadProducts();

// 🔄 Silent background refresh
setInterval(loadProducts, 5000);

const API = `${API_BASE}/products`;


let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartBar(){
  if(cart.length === 0){
    document.getElementById("cartBar").classList.add("hidden");
  } else {
    document.getElementById("cartBar").classList.remove("hidden");
    document.getElementById("cartCount").innerText =
      `${cart.reduce((a,b)=>a+b.qty,0)} Items Added`;
  }
}

function addToCart(product){
  let existing = cart.find(x => x._id === product._id);

  if(existing){
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  renderProducts();
  updateCartBar();
}

function decrease(product){
  let existing = cart.find(x => x._id === product._id);
  if(!existing) return;

  existing.qty--;
  if(existing.qty <= 0){
    cart = cart.filter(x => x._id !== product._id);
  }

  saveCart();
  renderProducts();
  updateCartBar();
}

async function loadProducts(){
  const res = await fetch(API);
  const products = await res.json();
  window.products = products;
  renderProducts();
}

function renderProducts(){
  const container = document.getElementById("products");
  container.innerHTML = "";

  window.products.forEach(p => {
    let exist = cart.find(x => x._id === p._id);

    container.innerHTML += `
      <div class="bg-gray-800 p-4 rounded">
        <img src="${p.image}" class="h-32 w-full object-cover rounded mb-2">
        <h2 class="text-lg font-bold">${p.name}</h2>
        <p class="text-sm text-gray-400">${p.description}</p>
        <p class="mt-1 font-bold">₹${p.price}</p>

        ${
          !p.available
          ? `<button class="bg-gray-500 mt-2 w-full py-1 rounded" disabled>Unavailable</button>`
          : exist
          ? `
          <div class="flex items-center gap-3 mt-2">
            <button onclick='decrease(${JSON.stringify(p)})' class="bg-red-500 px-3 py-1 rounded">-</button>
            <span class="text-xl font-bold">${exist.qty}</span>
            <button onclick='addToCart(${JSON.stringify(p)})' class="bg-green-500 px-3 py-1 rounded">+</button>
          </div>
          `
          : `<button onclick='addToCart(${JSON.stringify(p)})' class="bg-yellow-400 text-black mt-2 w-full py-1 rounded">Add +</button>`
        }
      </div>
    `;
  });
}

loadProducts();
updateCartBar();

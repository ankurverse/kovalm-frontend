const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || user.role !== "owner") {
  alert("Access denied");
  window.location.href = "../login.html";
}

async function loadProducts() {
  const res = await fetch(`${API_BASE}/products`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const products = await res.json();
  const box = document.getElementById("products");
  box.innerHTML = "";

  products.forEach(p => {
    box.innerHTML += `
      <div class="bg-gray-800 p-4 rounded-xl mb-3 border border-yellow-400 glow">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold">${p.name}</h2>
            <p class="text-gray-400">₹${p.price}</p>
            <p class="text-yellow-400 text-sm">Stock: ${p.quantity}</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="updateStock('${p._id}', -1)"
              class="bg-red-500 px-3 py-1 rounded">−</button>

            <button onclick="updateStock('${p._id}', 1)"
              class="bg-green-500 px-3 py-1 rounded">+</button>
          </div>
        </div>
      </div>
    `;
  });
}

async function updateStock(productId, change) {
  await fetch(`${API_BASE}/products/update-stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId, change })
  });

  loadProducts();
}

loadProducts();

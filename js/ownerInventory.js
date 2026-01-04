const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || user.role !== "owner") {
  alert("Access denied");
  window.location.href = "../login.html";
}

// 🔹 LOAD PRODUCTS
async function loadProducts() {
  const res = await fetch(`${API_BASE}/products`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
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
          </div>

          <button
            onclick="toggleProduct('${p._id}')"
            class="px-3 py-1 rounded font-bold ${
              p.available ? "bg-green-500" : "bg-red-500"
            }">
            ${p.available ? "Disable" : "Enable"}
          </button>
        </div>
      </div>
    `;
  });
}

// 🔹 TOGGLE PRODUCT
async function toggleProduct(id) {
  await fetch(`${API_BASE}/products/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId: id })
  });

  loadProducts();
}

// INITIAL LOAD
loadProducts();

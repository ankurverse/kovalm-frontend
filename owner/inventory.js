const token = localStorage.getItem("token");

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  const res = await fetch(`${API_BASE}/products/owner/all`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const products = await res.json();
  const box = document.getElementById("products");
  box.innerHTML = "";

  products.forEach(p => {
    box.innerHTML += `
      <div class="bg-gray-800 p-4 rounded border border-yellow-400 flex justify-between items-center">

        <div>
          <h2 class="font-bold">${p.name}</h2>
          <p class="text-sm text-gray-400">₹${p.price} • ${p.category}</p>
        </div>

        <div class="flex gap-2">
          <button
            onclick="toggleAvailability('${p._id}')"
            class="px-3 py-1 rounded ${p.available ? 'bg-green-500' : 'bg-red-500'}">
            ${p.available ? "Disable" : "Enable"}
          </button>

          <button
            onclick="deleteProduct('${p._id}')"
            class="bg-red-700 px-3 py-1 rounded">
            Delete
          </button>
        </div>

      </div>
    `;
  });
}

// ================= ADD PRODUCT =================
async function addProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const image = document.getElementById("image").value;

  if (!name || !price || !category) {
    alert("All fields required");
    return;
  }

  await fetch(`${API_BASE}/products/owner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, price, category, image })
  });

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("category").value = "";
  document.getElementById("image").value = "";

  loadProducts();
}

// ================= DELETE PRODUCT =================
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  await fetch(`${API_BASE}/products/owner/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadProducts();
}

// ================= TOGGLE AVAILABILITY =================
async function toggleAvailability(id) {
  await fetch(`${API_BASE}/products/owner/${id}/availability`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadProducts();
}

// ================= INIT =================
loadProducts();

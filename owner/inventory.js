const token = localStorage.getItem("token");

let allProducts = [];
let editProductId = null;

/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
  const res = await fetch(`${API_BASE}/products/owner/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  allProducts = await res.json();
  renderProducts(allProducts);
}

/* ================= RENDER PRODUCTS ================= */
function renderProducts(products) {
  const box = document.getElementById("products");
  box.innerHTML = "";

  products.forEach(p => {
    box.innerHTML += `
      <div class="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">

        <div>
          <h2 class="font-bold text-lg">${p.name}</h2>
          <p class="text-sm text-gray-400">₹${p.price} • ${p.category}</p>
          <p class="text-yellow-400 text-sm">
            Stock: ${p.quantity} ${p.quantity === 0 ? "(Out of stock)" : ""}
          </p>
        </div>

        <div class="flex gap-2 items-center">
          <button onclick="updateStock('${p._id}', -1)"
            class="bg-red-500 px-3 py-1 rounded font-bold"
            ${p.quantity === 0 ? "disabled" : ""}>−</button>

          <button onclick="updateStock('${p._id}', 1)"
            class="bg-green-500 px-3 py-1 rounded font-bold">+</button>

          <button onclick="openEditModal(
            '${p._id}',
            '${escapeQuotes(p.name)}',
            '${escapeQuotes(p.description || "")}',
            ${p.price},
            '${p.category}',
            '${p.image || ""}'
          )"
            class="bg-blue-500 px-3 py-1 rounded font-bold">
            Edit
          </button>

          <button onclick="deleteProduct('${p._id}')"
            class="bg-red-700 px-3 py-1 rounded font-bold">
            Delete
          </button>
        </div>

      </div>
    `;
  });
}

/* ================= SEARCH ================= */
function filterProducts() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(q)
  );
  renderProducts(filtered);
}

/* ================= ESCAPE ================= */
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

/* ================= UPDATE STOCK ================= */
async function updateStock(productId, change) {
  await fetch(`${API_BASE}/products/owner/update-stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId, change })
  });

  loadProducts();
}

/* ================= ADD PRODUCT ================= */
async function addProduct() {
  const name = document.getElementById("name").value;
  const description = document.getElementById("description").value;
  const price = Number(document.getElementById("price").value);
  const category = document.getElementById("category").value;
  const image = document.getElementById("image").value;
  const quantity = Number(document.getElementById("quantity").value || 0);

  if (!name || !price || !category) {
    alert("Name, price and category are required");
    return;
  }

  await fetch(`${API_BASE}/products/owner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, description, price, category, image, quantity })
  });

  document.querySelectorAll("#name,#description,#price,#category,#image,#quantity")
    .forEach(i => i.value = "");

  loadProducts();
}

/* ================= DELETE ================= */
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  await fetch(`${API_BASE}/products/owner/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadProducts();
}

/* ================= EDIT MODAL ================= */
function openEditModal(id, name, description, price, category, image) {
  editProductId = id;

  document.getElementById("editName").value = name;
  document.getElementById("editDescription").value = description;
  document.getElementById("editPrice").value = price;
  document.getElementById("editCategory").value = category;
  document.getElementById("editImage").value = image;

  document.getElementById("editModal").classList.remove("hidden");
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
}

async function saveEdit() {
  const payload = {
    name: document.getElementById("editName").value,
    description: document.getElementById("editDescription").value,
    price: Number(document.getElementById("editPrice").value),
    category: document.getElementById("editCategory").value,
    image: document.getElementById("editImage").value
  };

  await fetch(`${API_BASE}/products/owner/${editProductId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  closeEditModal();
  loadProducts();
}

/* ================= EXCEL ================= */
async function uploadExcel() {
  const file = document.getElementById("excelFile").files[0];
  if (!file) return alert("Select file");

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}/products/owner/upload-stock`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  });

  const data = await res.json();
  alert(`Updated: ${data.updated}, Skipped: ${data.skipped}`);
  loadProducts();
}

async function undoLastUpload() {
  if (!confirm("Undo last upload?")) return;

  const res = await fetch(`${API_BASE}/products/owner/undo-last-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  alert(data.msg);
  loadProducts();
}

/* ================= DOWNLOAD ================= */
async function downloadInventory() {
  const res = await fetch(`${API_BASE}/products/owner/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const products = await res.json();
  let csv = "Name,Category,Price,Quantity\n";
  products.forEach(p => {
    csv += `"${p.name}","${p.category}",${p.price},${p.quantity}\n`;
  });

  const blob = new Blob([csv]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "inventory.csv";
  a.click();
}

/* ================= INIT ================= */
loadProducts();

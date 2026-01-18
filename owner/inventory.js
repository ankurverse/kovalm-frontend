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
          <p class="text-yellow-400 text-sm">
            Stock: ${p.quantity}
            ${p.quantity === 0 ? "(Out of stock)" : ""}
          </p>
        </div>

        <div class="flex gap-2 items-center">
          <button
            onclick="updateStock('${p._id}', -1)"
            class="bg-red-500 px-3 py-1 rounded font-bold"
            ${p.quantity === 0 ? "disabled" : ""}
          >
            −
          </button>

          <button
            onclick="updateStock('${p._id}', 1)"
            class="bg-green-500 px-3 py-1 rounded font-bold"
          >
            +
          </button>

          <button
            onclick="deleteProduct('${p._id}')"
            class="bg-red-700 px-3 py-1 rounded font-bold"
          >
            Delete
          </button>
        </div>

      </div>
    `;
  });
}

// ================= UPDATE STOCK =================
async function updateStock(productId, change) {
  await fetch(`${API_BASE}/products/owner/update-stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      productId,
      change
    })
  });

  loadProducts();
}

// ================= ADD PRODUCT =================
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
    body: JSON.stringify({
      name,
      description,
      price,
      category,
      image,
      quantity
    })
  });

  // Clear form
  document.getElementById("name").value = "";
  document.getElementById("description").value = "";
  document.getElementById("price").value = "";
  document.getElementById("category").value = "";
  document.getElementById("image").value = "";
  document.getElementById("quantity").value = "";

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

// ================= INIT =================
loadProducts();


async function downloadInventory() {
  const res = await fetch(`${API_BASE}/products/owner/all`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const products = await res.json();

  if (!products.length) {
    alert("No products found");
    return;
  }

  let csv = "Product Name,Category,Price,Quantity,Available\n";

  products.forEach(p => {
    csv += `"${p.name}","${p.category}",${p.price},${p.quantity},${p.available ? "Yes" : "No"}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Inventory_Report.csv";
  a.click();

  URL.revokeObjectURL(url);
}

async function uploadExcel() {
  const fileInput = document.getElementById("excelFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an Excel file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/products/owner/upload-stock`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();

  alert(
    `Stock Update Done ✅\nUpdated: ${data.updated}\nSkipped: ${data.skipped}`
  );

  fileInput.value = "";
  loadProducts();
}


async function undoLastUpload() {
  if (!confirm("Undo last Excel stock upload?")) return;

  const res = await fetch(`${API_BASE}/products/owner/undo-last-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  alert(data.msg);
  loadProducts();
}

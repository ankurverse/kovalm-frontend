let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));

let previousOrderCount = 0;

const sound = new Audio("sounds/orderalert.mp3");
sound.volume = 0.9;

// ACCESS CONTROL
if (!token || !user || user.role !== "owner") {
  alert("Access Denied");
  window.location.href = "../login.html";
}

async function loadOrders() {
  const res = await fetch(`${API_BASE}/orders/owner/all`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Failed to load orders");
    return;
  }

  const orders = await res.json();

  if (previousOrderCount !== 0 && orders.length > previousOrderCount) {
    sound.play();
  }
  previousOrderCount = orders.length;

  const box = document.getElementById("orders");
  box.innerHTML = "";

  if (orders.length === 0) {
    box.innerHTML = `
      <div class="text-center text-gray-400 mt-10">
        No orders yet
      </div>
    `;
    return;
  }

  orders.forEach(o => {
    box.innerHTML += `
      <div class="bg-gray-800 p-4 rounded-xl shadow-md border border-yellow-400 glow mb-4">

        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold">Order #${o._id.slice(-5)}</h2>

          <span class="px-3 py-1 rounded font-bold">
            ${o.status}
          </span>
        </div>

        <p class="mt-2"><b>Room:</b> ${o.roomNo || "N/A"}</p>
        <p class="mt-1"><b>Customer:</b> ${o.customerName || "N/A"}</p>
        <p class="mt-1"><b>Phone:</b> ${o.customerPhone || "N/A"}</p>

        <p class="mt-1"><b>UTR:</b>
          <span class="text-yellow-400 font-bold">
            ${o.transactionId || "—"}
          </span>
        </p>

        <p class="mt-2 font-bold">Items:</p>
        ${o.items.map(i => `<p>- ${i.name} x ${i.qty}</p>`).join("")}

        <p class="mt-2 font-bold text-lg">Total: ₹${o.totalAmount}</p>

        <div class="mt-3 flex gap-2">
          ${o.status === "pending" ? `
            <button onclick="accept('${o._id}')" class="bg-green-500 px-3 py-1 rounded">Accept</button>
            <button onclick="decline('${o._id}')" class="bg-red-500 px-3 py-1 rounded">Decline</button>
          ` : ""}

          ${o.status === "accepted" ? `
            <button onclick="updateStatus('${o._id}','preparing')" class="bg-blue-500 px-3 py-1 rounded">Preparing</button>
          ` : ""}

          ${o.status === "preparing" ? `
            <button onclick="updateStatus('${o._id}','outForDelivery')" class="bg-purple-500 px-3 py-1 rounded">Out</button>
          ` : ""}

          ${o.status === "outForDelivery" ? `
            <button onclick="updateStatus('${o._id}','delivered')" class="bg-green-600 px-3 py-1 rounded">Delivered</button>
          ` : ""}
        </div>
      </div>
    `;
  });
}

async function accept(id) {
  await fetch(`${API_BASE}/orders/owner/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ orderId: id })
  });
  loadOrders();
}

async function decline(id) {
  await fetch(`${API_BASE}/orders/owner/decline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ orderId: id })
  });
  loadOrders();
}

async function updateStatus(id, status) {
  await fetch(`${API_BASE}/orders/owner/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ orderId: id, status })
  });
  loadOrders();
}

loadOrders();
setInterval(loadOrders, 5000);

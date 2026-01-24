let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));

if(!token || !user || user.role !== "owner"){
  alert("Access Denied");
  window.location.href="../login.html";
}



async function load(){

  const res = await fetch(`${API_BASE}/orders/owner/super-analytics`, {
    headers:{
      "Authorization": `Bearer ${token}`
    }
  });

  const d = await res.json();

  document.getElementById("total").innerText = d.count.total;
  document.getElementById("delivered").innerText = d.count.delivered;
  document.getElementById("declined").innerText = d.count.declined;
  document.getElementById("pending").innerText = d.count.pending;

  document.getElementById("todayOrders").innerText = d.today.orders;
  document.getElementById("todayMoney").innerText = "₹" + d.today.earning;

  document.getElementById("yOrders").innerText = d.yesterday.orders;
  document.getElementById("yMoney").innerText = "₹" + d.yesterday.earning;

  document.getElementById("mOrders").innerText = d.month.orders;
  document.getElementById("mMoney").innerText = "₹" + d.month.earning;

  document.getElementById("todayEarningBig").innerText =
  "₹" + d.today.earning;


}


function downloadReport(){
  fetch(`${API_BASE}/orders/owner/super-analytics`,{
    headers:{ "Authorization": `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(d => {
    let csv = "OrderID,Status,Total,Date\n";
    d.orders.forEach(o=>{
      csv += `${o._id},${o.status},${o.totalAmount},${new Date(o.createdAt).toLocaleString()}\n`;
    });

    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Cafe_Report.csv";
    a.click();
  });
}

async function loadOrderStatus() {
  const res = await fetch(`${API_BASE}/orders/owner/status`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  document.getElementById("orderStatus").innerText =
    data.isAcceptingOrders
      ? "🟢 JBD Mart is OPEN for orders"
      : "🔴 JBD Mart is CLOSED";
}

async function openOrders() {
  await fetch(`${API_BASE}/orders/owner/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ isAcceptingOrders: true })
  });
  loadOrderStatus();
}

async function closeOrders() {
  await fetch(`${API_BASE}/orders/owner/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ isAcceptingOrders: false })
  });
  loadOrderStatus();
}

load();
loadOrderStatus();
setInterval(load,5000);

async function loadLowStock() {
  const res = await fetch(`${API_BASE}/products/owner/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const products = await res.json();
  const table = document.getElementById("lowStockTable");
  table.innerHTML = "";

  const lowStock = products.filter(p => p.quantity <= 5);

  if (lowStock.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="3" class="py-3 text-center text-green-400">
          All products sufficiently stocked ✅
        </td>
      </tr>
    `;
    return;
  }

  lowStock.forEach(p => {
    const status =
      p.quantity === 0
        ? `<span class="px-2 py-1 text-xs rounded bg-red-600 text-white">Out</span>`
        : `<span class="px-2 py-1 text-xs rounded bg-yellow-500 text-black">Low</span>`;

    table.innerHTML += `
      <tr>
        <td class="py-2">${p.name}</td>
        <td class="py-2 text-center font-bold text-yellow-400">
          ${p.quantity}
        </td>
        <td class="py-2 text-center">
          ${status}
        </td>
      </tr>
    `;
  });
}


loadLowStock();
setInterval(loadLowStock, 5000);


function sendPromo(event) {
  const title = prompt("Enter notification title:");
  if (!title) return;

  const body = prompt("Enter notification message:");
  if (!body) return;

  const btn = event.target;
  btn.disabled = true;
  btn.innerText = "Sending...";

  fetch(`${API_BASE}/notifications/send-promo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ title, body })
  })
  .then(res => res.json())
  .then(() => {
    alert("Notification sent successfully!");
  })
  .catch(err => {
    alert("Failed to send notification");
    console.error(err);
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerText = "📢 Send Notification";
  });
}

async function addPromo() {
  const image = document.getElementById("promoImage").value;
  if (!image) return alert("Image URL required");

  await fetch(`${API_BASE}/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ image })
  });

  alert("Poster added");
  document.getElementById("promoImage").value = "";
}


let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));

if(!user){
  window.location.href = "login.html";
}

async function loadOrders(){
  const res = await fetch(`${API_BASE}/orders/my`, {
    headers:{
      "Authorization": `Bearer ${token}`
    }
  });

  const orders = await res.json();

  const currentDiv = document.getElementById("current");
  const historyDiv = document.getElementById("history");

  currentDiv.innerHTML = "";
  historyDiv.innerHTML = "";

  if(orders.length === 0){
    currentDiv.innerHTML = `
      <div class="text-center text-gray-400 mt-10">
        No orders yet 
      </div>
    `;
    return;
  }

  const active = orders.find(o => 
    o.status !== "delivered" && o.status !== "declined"
  );

  if(active){
    currentDiv.innerHTML = `
      <div class="bg-gray-800 p-4 rounded-xl shadow glow">
        <h2 class="text-lg font-bold">Current Order</h2>
        <p>Status: ${active.status}</p>
        <p>Total: ₹${active.totalAmount}</p>
      </div>
    `;
  }

  const previous = orders.filter(o =>
    o.status === "delivered" || o.status === "declined"
  );

  previous.forEach(o => {
    historyDiv.innerHTML += `
      <div class="bg-gray-800 p-4 rounded-xl mb-3">
        <p>${new Date(o.createdAt).toLocaleString()}</p>
        <p>Status: ${o.status}</p>
        <p>Total: ₹${o.totalAmount}</p>
      </div>
    `;
  });
}

loadOrders();
setInterval(loadOrders, 5000);

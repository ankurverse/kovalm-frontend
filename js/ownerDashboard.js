let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));

if(!token || !user || user.role !== "owner"){
  alert("Access Denied");
  window.location.href="../login.html";
}

let chart;

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

  drawChart(d.orders);
}

function drawChart(orders){
  let map = {};

  orders.forEach(o=>{
    let d = new Date(o.createdAt).toLocaleDateString();
    map[d] = (map[d] || 0) + 1;
  });

  let labels = Object.keys(map);
  let values = Object.values(map);

  const ctx = document.getElementById("chart");
  if(chart) chart.destroy();

  chart = new Chart(ctx,{
    type:"bar",
    data:{
      labels,
      datasets:[{
        label:"Orders",
        data:values,
        backgroundColor:"yellow"
      }]
    }
  });
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
      ? "🟢 Cafe is OPEN for orders"
      : "🔴 Cafe is CLOSED";
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

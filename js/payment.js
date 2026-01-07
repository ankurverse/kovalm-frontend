console.log("payment.js loaded successfully ✅");

window.submitPaymentProof = async function () {

  console.log("I HAVE PAID clicked ✅");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!token || !user) {
    alert("Please login again");
    window.location.href = "login.html";
    return;
  }

  if (cart.length === 0) {
    alert("Cart empty");
    window.location.href = "index.html";
    return;
  }

  const utr = document.getElementById("utr").value.trim();
  if (utr.length < 8) {
    alert("Enter valid UTR (min 8 characters)");
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + 4;

  const body = {
    items: cart,
    subtotal,
    total,
    roomNo: user.roomNo || "UNKNOWN",
    utr,
    name: user.name || "UNKNOWN",
    phone: user.phone || "N/A"
  };

  try {
    const res = await fetch(`${API_BASE}/orders/payment`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    // 🔴 IMPORTANT CHANGE (HANDLE CAFE CLOSED)
    if (!res.ok) {
      document.getElementById("msg").innerText =
        data.msg || "Cafe is currently not accepting orders";
      return;
    }

    // ✅ SUCCESS
    document.getElementById("msg").innerText = data.msg;

    localStorage.removeItem("cart");

    setTimeout(() => {
      window.location.href = "orders.html";
    }, 800);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};


// ===============================
// 🔹 RENDER SUMMARY ON PAGE LOAD
// ===============================
(function renderSummary(){
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const user = JSON.parse(localStorage.getItem("user"));

  if (!cart.length || !user) return;

  const subtotal = cart.reduce((s,i)=> s + i.price*i.qty, 0);
  const total = subtotal + 4;

  document.getElementById("summary").innerText =
    `Subtotal: ₹${subtotal} | Delivery: ₹4 | Total: ₹${total}`;

  document.getElementById("room").innerText =
    user.roomNo || "Not provided";
})();

// ===============================
// 🔹 OPEN UPI APP WITH AMOUNT
// ===============================
window.openUPIApp = function () {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!cart.length) {
    alert("Cart empty");
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + 4;

  const upiId = "931657773@ybl";
  const merchant = "JBD Mart";

  const upiURL =
    `upi://pay?pa=${upiId}` +
    `&pn=${encodeURIComponent(merchant)}` +
    `&am=${total}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent("Order Payment")}`;

  window.location.href = upiURL;
};

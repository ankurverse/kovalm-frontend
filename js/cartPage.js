let cartData = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cartData));
}

function renderCart(){
  const container = document.getElementById("cartItems");
  container.innerHTML = "";

  if(cartData.length === 0){
    container.innerHTML = `
      <div class="text-center text-gray-400 mt-10">
        Your cart is empty 😶
      </div>
    `;
    document.getElementById("subtotal").innerText = "₹0";
    document.getElementById("total").innerText = "₹0";
    document.getElementById("placeBtn").disabled = true;
    return;
  }

  cartData.forEach(item => {
    container.innerHTML += `
      <div class="bg-gray-800 p-3 rounded-xl mb-3 flex justify-between items-center">

        <div>
          <h2 class="text-lg font-bold">${item.name}</h2>
          <p class="text-gray-400 text-sm">₹${item.price}</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="decreaseItem('${item._id}')" class="bg-red-500 px-3 py-1 rounded">−</button>
          <span class="text-xl font-bold">${item.qty}</span>
          <button onclick="increaseItem('${item._id}')" class="bg-green-500 px-3 py-1 rounded">+</button>
        </div>
      </div>
    `;
  });

  updateBill();
}

function increaseItem(id){
  let item = cartData.find(i => i._id === id);
  item.qty++;
  saveCart();
  renderCart();
}

function decreaseItem(id){
  let item = cartData.find(i => i._id === id);
  item.qty--;

  if(item.qty <= 0){
    cartData = cartData.filter(i => i._id !== id);
  }

  saveCart();
  renderCart();
}

function updateBill(){
  let subtotal = cartData.reduce((sum, i) => sum + i.price * i.qty, 0);
  let total = subtotal > 0 ? subtotal + 4 : 0;

  document.getElementById("subtotal").innerText = "₹" + subtotal;
  document.getElementById("total").innerText = "₹" + total;

  if(subtotal < 40){
    document.getElementById("warning").classList.remove("hidden");
    document.getElementById("placeBtn").disabled = true;
  } else {
    document.getElementById("warning").classList.add("hidden");
    document.getElementById("placeBtn").disabled = false;
  }
}

function proceedToCheckout(){
  window.location.href = "payment.html";
}

renderCart();

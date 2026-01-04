function showToast(msg, type="success"){
  const color = type === "error" ? "bg-red-500" : "bg-green-500";

  const toast = document.createElement("div");
  toast.className = `
  fixed bottom-5 left-1/2 transform -translate-x-1/2
  ${color} text-white px-4 py-2 rounded shadow-lg`;

  toast.innerText = msg;
  document.body.appendChild(toast);

  setTimeout(()=> toast.remove(), 2000);
}

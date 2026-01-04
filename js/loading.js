function showLoading(){
  document.body.insertAdjacentHTML("beforeend", `
    <div id="loader"
    class="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div class="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>

    </div>
  `);
}

function hideLoading(){
  const loader = document.getElementById("loader");
  if(loader) loader.remove();
}

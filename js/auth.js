const API = API_BASE;


// ======================
// LOGIN
// ======================
async function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!email || !password){
    document.getElementById("msg").innerText = "All fields required";
    return;
  }

  try{
    const res = await fetch(`${API}/auth/login`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if(!res.ok){
      document.getElementById("msg").innerText = data.msg || "Login failed";
      return;
    }

    // SAVE AUTH
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // REDIRECT
    if(data.user.role === "owner"){
      window.location.href = "owner/dashboard.html";
    } else {
      window.location.href = "index.html";
    }

  }catch(err){
    document.getElementById("msg").innerText = "Server error";
  }
}


// ======================
// SIGNUP (🔥 FIXED)
// ======================
async function signup(){
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const roomNo = document.getElementById("room").value;
  const password = document.getElementById("password").value;

  if(!name || !email || !phone || !roomNo || !password){
    document.getElementById("msg").innerText = "All fields required";
    return;
  }

  try{
    const res = await fetch(`${API}/auth/signup`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        roomNo,
        password
      })
    });

    const data = await res.json();

    if(!res.ok){
      document.getElementById("msg").innerText = data.msg;
      return;
    }

    alert("Signup successful. Please login.");
    window.location.href = "login.html";

  }catch(err){
    document.getElementById("msg").innerText = "Signup failed";
  }
}

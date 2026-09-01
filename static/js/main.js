document.addEventListener("DOMContentLoaded", function(){
  // Mobile menu toggle
  var btn = document.getElementById("mobile-menu-btn");
  if(btn){
    btn.addEventListener("click", function(){
      var nav = document.querySelector(".main-nav");
      if(nav) nav.style.display = nav.style.display === "flex" ? "none" : "flex";
    });
  }

  // Add small interaction: highlight nav on scroll (optional)
  var navLinks = document.querySelectorAll(".main-nav .nav-btn");
  navLinks.forEach(function(a){
    a.addEventListener("click", function(){
      navLinks.forEach(n => n.classList.remove("active"));
      this.classList.add("active");
    });
  });
});

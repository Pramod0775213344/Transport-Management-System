// window.addEventListener("DOMContentLoaded", () => {
//   // overlay eka gnnawa eke id eken
// //   const overlay = document.getElementById("dotsOverlay");

// //   // hidden kiyna attribute eka thibunoth remove karanwa
// //   // overlay.removeAttribute("hidden"); // show it

// //   // overlay eka 1 seconds passe hide karanwa
// //   setTimeout(() => {
// //     overlay.setAttribute("hidden", "");
// //   }, 1000);
// // });

//-----------------------table loading show function-------------------
// table eke loading spin eka load karanwa
function showTableLoading() {
  const overlay = document.getElementById("tableOverlay");

  overlay.removeAttribute("hidden");
  // mark container as busy for accessibility
  overlay.parentElement.setAttribute("aria-busy", "true");
  // overlay eka 1 seconds passe hide karanwa
  setTimeout(hideOverlay, 1000);
  function hideOverlay() {
    overlay.setAttribute("hidden", "");
    overlay.parentElement.setAttribute("aria-busy", "false");
  }
}

// dom load karanwa logout overlay eka
// document.addEventListener("DOMContentLoaded", () => {
//   // logout overlay eka gannawa eke id eken
//   const overlay = document.getElementById("logoutOverlay");
//   // logout button eka gannawa eke id eken
//   const logoutBtn = document.getElementById("logoutBtn");

//   // logout button eka click karan kota logout overlay eka pennanawa
//   logoutBtn.addEventListener("click", (e) => {
//     //
//     e.preventDefault();

//     // logout overlay eka display karanwa
//     overlay.removeAttribute("hidden");

//     // podi welawak logout overlay eka display karanwa
//     setTimeout(() => {
//       // Perform logout (AJAX or form submit)
//       fetch("/logout", { method: "POST" }).finally(() => {
//         // Do NOT hide the overlay here!
//         // Redirect to login page directly
//         window.location.href = "/login";
//       });
//     }, 1500); // delay 1.5 seconds before logout
//   });
// });

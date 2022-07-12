const toggleIcon = document.getElementById("nav-toggle-icon");
const icon = toggleIcon.querySelector(".material-icons");

// switch icon
toggleIcon.addEventListener("click", () => {
  if (icon.textContent === "menu") {
    icon.textContent = "close";
  } else {
    icon.textContent = "menu";
  }
});

const header = document.getElementById("sticky-header");

// scroll padding is not static
function scrollPaddingReset() {
  document.documentElement.style.scrollPaddingTop =
    header.getBoundingClientRect().height + "px";
}

window.addEventListener("load", scrollPaddingReset);
window.addEventListener("resize", scrollPaddingReset);

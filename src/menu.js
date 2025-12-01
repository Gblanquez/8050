import sketchManager from "./sketch/sketch";

export function openMenu() {
    const menuBtn = document.querySelector(".navbar-menu");
    const overlay = document.querySelector(".navbar-o-w");
  
    if (!menuBtn || !overlay) return;
  
    let isOpen = false;
  
    menuBtn.addEventListener("click", () => {
      isOpen = !isOpen;
  
      if (isOpen) {
        menuBtn.classList.add("open");
        overlay.style.display = "block";

        const wrap = document.querySelector('.canvas-wrap');
        sketchManager.init(wrap);

      } else {
        menuBtn.classList.remove("open");
        overlay.style.display = "none";
      }
    });
  }
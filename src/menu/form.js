export function openForm() {
    const openTrigger = document.querySelector('[data-a="contact-trigger"]');
    const closeTrigger = document.querySelector('[data-a="close-trigger"]');
    const formWrapper = document.querySelector('.navbar-form-wrapper');
  
    if (!openTrigger || !formWrapper) return;
  
    // OPEN
    openTrigger.addEventListener("click", () => {
      formWrapper.classList.add("is-open");
    });
  
    // CLOSE
    if (closeTrigger) {
      closeTrigger.addEventListener("click", () => {
        formWrapper.classList.remove("is-open");
      });
    }
  }
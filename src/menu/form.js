export function openForm() {
    const trigger = document.querySelector('[data-a="contact-trigger"]');
    const formWrapper = document.querySelector('.navbar-form-wrapper');
  
    if (!trigger || !formWrapper) return;
  
    trigger.addEventListener("click", () => {
      formWrapper.classList.toggle("is-open");
    });
  }
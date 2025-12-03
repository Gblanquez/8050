import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { animateTitle } from "./title";
import { linesAnimation } from "./lines";
import { bodyTextAnimation } from "./bodytext";
import { labelTextAnimation } from "./textLabel";
import { navIn } from "../menu/nav";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function loadPage() {
  const loadTextEl = document.querySelector('[data-a="load-text"]');
  const wrapper = document.querySelector('[data-a="wrapper"]');
  const loadWrapper = document.querySelector('.load-wrapper');
  const content = document.querySelector('[data-a="content"]');

  if (!wrapper) return;

  const tl = gsap.timeline();

  tl.set(content, {
    opacity: 0,
    position: "relative",
    zIndex: 102
  });

  if (loadTextEl) {
    const counter = { value: 0 };

    tl.to(counter, {
      value: 100,
      duration: 1.4,
      ease: "power2.out",
      onUpdate() {
        loadTextEl.textContent = Math.round(counter.value);
      }
    });

    tl.to(loadTextEl, {
      y: "-100%",
      duration: 0.6,
      ease: "power3.inOut",
      onComplete() {
        if (loadWrapper) {


        }
      }
    });
  }

  gsap.set(wrapper, {
    clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    rotateZ: -38,
  });

  tl.to(wrapper, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    rotateZ: 0,
    duration: 1.4,
    ease: "power3.out",
  },
  
);

tl.to(content, {
    opacity: 1,
    duration: 0.4,
    ease: "expo.out",
    onStart: () => {
        animateTitle()
        linesAnimation()
        bodyTextAnimation()
        labelTextAnimation()
        navIn()
    }
},2.3);
}
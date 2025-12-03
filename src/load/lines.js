import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function linesAnimation() {
  const lines = document.querySelectorAll('[data-a="line"]');
  if (!lines) return;


  const tl = gsap.timeline()

  tl.set(lines,{
    scaleX: 0,
    opacity: 0,
    transformOrigin: 'center left'
  })

  tl.to(lines,{
    scaleX: 1,
    opacity: 1,
    stagger:
    {
        each: 0.01
    },
    duration: 1.2,
    ease: 'power3.out'
  })
}
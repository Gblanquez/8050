import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function labelTextAnimation() {
  const bodyLabel = document.querySelectorAll('[data-a="label-text"]');
  if (!bodyLabel.length) return;

  bodyLabel.forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      autoSplit: true,
      mask: "lines",
      onSplit: (self) => {
        gsap.set(self.lines, { y: "110%" });

        return gsap.to(self.lines, {
          y: "0%",
          opacity: 1,
          stagger: 0.02,
          duration: 1.2,
          ease: "power3.out"
        });
      }
    });
  });
}
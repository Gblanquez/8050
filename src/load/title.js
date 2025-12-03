import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export function animateTitle() {
  SplitText.create('[data-a="headline"]', {
    type: "lines",
    autoSplit: true,
    mask: "lines",
    onSplit: (self) => {
      self.lines.forEach((line, i) => {
        const indexSpans = line.querySelectorAll(".text-index");

        indexSpans.forEach((span, j) => {
          if (i === 0 && j === 0) {
            line.style.paddingLeft = "120px";
          } else {
            span.remove();
          }
        });
      });

      gsap.set(self.lines, { y: "110%" });

      return gsap.to(self.lines, {
        y: "0%",
        opacity: 1,
        stagger: 0.05,
        duration: 0.9,
        ease: "power3.out"
      });
    }
  });
}
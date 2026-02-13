import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(SplitText)

export function textIntro() {
  // Title — split into lines, y:110% → 0%
  document.querySelectorAll('[data-a="title"]').forEach((el) => {
    gsap.set(el, { opacity: 1 })
    SplitText.create(el, {
      type: "lines",
      autoSplit: true,
      mask: "lines",
      onSplit: (self) => {
        gsap.set(self.lines, { y: "110%" })
        return gsap.to(self.lines, {
          y: "0%",
          stagger: 0.05,
          duration: 0.9,
          ease: "power3.out"
        })
      }
    })
  })

  // Body — split into lines, y:110% → 0%
  document.querySelectorAll('[data-a="body"]').forEach((el) => {
    gsap.set(el, { opacity: 1 })
    SplitText.create(el, {
      type: "lines",
      autoSplit: true,
      mask: "lines",
      onSplit: (self) => {
        gsap.set(self.lines, { y: "110%" })
        return gsap.to(self.lines, {
          y: "0%",
          stagger: 0.03,
          duration: 1.0,
          ease: "power3.out"
        })
      }
    })
  })

  // Logo — y:110% + opacity:0 → y:0% + opacity:1
  gsap.fromTo('[data-a="logo"]',
    { y: "110%", opacity: 0 },
    { y: "0%", opacity: 1, duration: 1.0, ease: "power3.out" }
  )

  // Project lines — scaleX:0 → 1, origin right
  gsap.fromTo(".project-line",
    { scaleX: 0, opacity: 0, transformOrigin: "right center" },
    { scaleX: 1, opacity: 1, stagger: 0.04, duration: 1.2, ease: "power3.out" }
  )
}

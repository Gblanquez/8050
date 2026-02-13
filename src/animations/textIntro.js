import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(SplitText)

export function textIntro() {
  // Title — split into chars, animate from offset/rotated state to rest
  document.querySelectorAll('[data-a="title"]').forEach((el) => {
    gsap.set(el, { opacity: 1 })
    SplitText.create(el, {
      type: "lines,words,chars",
      autoSplit: true,
      // mask: "lines",
      onSplit: (self) => {
        gsap.set(self.chars, { x: '-50%', y: '110%', rotateX: 72, rotateY: 45, rotateZ: 4, opacity: 0 })
        return gsap.to(self.chars, {
          x: '0%',
          y: '0%',
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          opacity: 1,
          duration: 2.2,
          ease: 'power3.out',
          stagger: { each: 0.03 }
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
          duration: 1.8,
          ease: "power3.out"
        })
      }
    })
  })

  // Logo — y:110% + opacity:0 → y:0% + opacity:1
  gsap.fromTo('[data-a="logo"]',
    {  opacity: 0 },
    { opacity: 1, duration: 1.6, ease: "none" }
  )

  // Project lines — scaleX:0 → 1, origin right
  gsap.fromTo(".project-line",
    { scaleX: 0, opacity: 0, transformOrigin: "left center" },
    { scaleX: 1, opacity: 1, stagger: 0.04, duration: 1.8, ease: "power3.out" }
  )
}

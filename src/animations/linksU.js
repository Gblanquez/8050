import { gsap } from "gsap";

export default function linkUnderline() {
  const links = document.querySelectorAll('[data-a="link-u"]');
  if (!links.length) return;

  links.forEach((link) => {
    const u1 = link.querySelector(".underline.first");
    const u2 = link.querySelector(".underline.second");
    if (!u1 || !u2) return;

    gsap.set(u1, { scaleX: 1, transformOrigin: "right center" });
    gsap.set(u2, { x: "-110%" });

    const openTl = gsap.timeline({ paused: true });
    openTl
      .to(
        u1,
        {
          scaleX: 0,
          duration: 0.6,
          ease: "expo.out",
          transformOrigin: "right center",
        },
        0
      )
      .to(
        u2,
        {
          x: "0%",
          duration: 0.6,
          ease: "expo.out",
        },
        0.1
      );

    const closeTl = gsap.timeline({ paused: true });
    closeTl
      .to(
        u2,
        {
          x: "-110%",
          duration: 0.6,
          ease: "expo.out",

        },
        0
      )
      .to(
        u1,
        {
          scaleX: 1,
          duration: 0.6,
          ease: "expo.out",
          transformOrigin: "right center",
    
        },
        0.1
      );

    const onEnter = () => {
      closeTl.pause(0);
      openTl.restart();
    };

    const onLeave = () => {
      openTl.pause();
      closeTl.restart();
    };

    link.addEventListener("mouseenter", onEnter);
    link.addEventListener("mouseleave", onLeave);
    link.addEventListener("focus", onEnter);
    link.addEventListener("blur", onLeave);
  });
}
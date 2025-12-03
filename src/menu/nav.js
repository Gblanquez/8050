import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function navIn() {

  const boxLeft = document.querySelectorAll('[data-a="box-left"]');
  const boxRight = document.querySelectorAll('[data-a="box-right"]');

  const linesWrapper = document.querySelectorAll('.nv-line-wrap');
  const voiceText = document.querySelector('[data-a="voice-text"]');
  const logo = document.querySelector('[data-a="logo"]');

  if (!boxLeft || !boxRight || !linesWrapper || !voiceText || !logo) return;

  const tl = gsap.timeline();

  tl.set(boxLeft, {
    clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
    opacity: 0,
    rotateZ: -39,
    y: '-100%'
  });

  tl.set(boxRight, {
    clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
    rotateZ: 39,
    opacity: 0,
    y: '-100%'
  });

  tl.set(linesWrapper, {
    scaleX: 0,
    transformOrigin: 'center right',
    opacity: 0,
  });

  tl.set(voiceText, {
    x: '-100%',
    opacity: 0,
  });

  tl.set(logo, {
    x: '-100%',
    opacity: 0,
  });

  tl.to(boxLeft, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    opacity: 1,
    delay: 0.2,
    rotateZ: 0,
    y: '0',
    duration: 0.8,
    ease: "power2.out"
  });

  tl.to(boxRight, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    opacity: 1,
    delay: 0.2,
    rotateZ: 0,
    y: '0',
    duration: 0.8,
    ease: "power2.out"
  }, 0);

  tl.to(linesWrapper, {
    scaleX: 1,
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out',
    stagger:
    {
        each: 0.02
    }
  }, 0.4);

  tl.to(voiceText, {
    x: '0%',
    opacity: 1,
    duration: 1.2,
    ease: 'power3.out'
  }, 0.4);

  tl.to(logo, {
    x: '0%',
    opacity: 1,
    duration: 1.2,
    ease: 'power3.out'
  }, 0.4);
}
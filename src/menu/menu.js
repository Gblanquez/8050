import sketchManager from "../sketch/sketch";
import { openForm } from "./form";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";


gsap.registerPlugin(SplitText);

export function openMenu() {
  const menuBtn = document.querySelector(".navbar-menu");
  const overlay = document.querySelector(".navbar-o-w");
  const lines = document.querySelectorAll(".navbar-line");
  const navTitles = document.querySelectorAll('[data-a="nav-title"]');
  const navLabels = document.querySelectorAll('[data-a="nav-label"]');

  if (!menuBtn || !overlay) return;

  let isOpen = false;
  let tl = null;
  let titleSplits = [];
  let labelSplits = [];

  // store original HTML once
  [...navTitles, ...navLabels].forEach(el => {
    if (!el.dataset.original) el.dataset.original = el.innerHTML;
  });

  function revertSplits() {
    titleSplits.forEach(s => s.revert());
    labelSplits.forEach(s => s.revert());
    titleSplits = [];
    labelSplits = [];
  }

  function open() {
    openForm();

    menuBtn.classList.add("open");
    overlay.classList.add("open");


    const wrap = document.querySelector(".canvas-wrap");
    sketchManager.init(wrap);

    gsap.delayedCall(0.1, () => {
      sketchManager.animateMenuMeshes(true)
      sketchManager.animateMenuIntro()
    })

    revertSplits();

    navTitles.forEach(el => (el.innerHTML = el.dataset.original));
    navLabels.forEach(el => (el.innerHTML = el.dataset.original));

    titleSplits = [...navTitles].map(
      el => new SplitText(el, { type: "lines", mask: "lines" })
    );

    labelSplits = [...navLabels].map(
      el => new SplitText(el, { type: "lines", mask: "lines" })
    );

    const titleLines = titleSplits.flatMap(s => s.lines);
    const labelLines = labelSplits.flatMap(s => s.lines);

    gsap.set([titleLines, labelLines], { y: "110%", opacity: 0 });
    gsap.set(lines, { scaleX: 0, opacity: 0 });

    tl = gsap.timeline();

    tl.fromTo(
      overlay,
      { scaleY: 0, opacity: 0, transformOrigin: "bottom center" },
      { scaleY: 1, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    tl.to(
      titleLines,
      {
        y: "0%",
        opacity: 1,
        duration: 1.2,
        stagger: 0.03,
        ease: "power3.out"
      },
      0.4
    );

    tl.to(
      lines,
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.8,
        stagger: 0.04,
        ease: "power3.out"
      },
      0.45
    );

    tl.to(
      labelLines,
      {
        y: "0%",
        opacity: 1,
        duration: 1.4,
        stagger: 0.03,
        ease: "power3.out"
      },
      0.55
    );
  }

  function close() {
    if (tl) {
      tl.kill();
      tl = null;
    }

    revertSplits();
    sketchManager.animateMenuMeshes(false);

    menuBtn.classList.remove("open");
    overlay.classList.remove("open");

    navTitles.forEach(el => (el.innerHTML = el.dataset.original));
    navLabels.forEach(el => (el.innerHTML = el.dataset.original));
  }

  menuBtn.addEventListener("click", () => {
    isOpen ? close() : open();
    isOpen = !isOpen;
  });
}
import sketchManager from "../sketch/sketch";
import { openForm } from "./form";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(SplitText, CustomEase);

export function openMenu() {
  const menuBtn = document.querySelector(".navbar-menu");
  const overlay = document.querySelector(".navbar-o-w");
  const lines = document.querySelectorAll(".navbar-line");
  const navTitles = document.querySelectorAll('[data-a="nav-title"]');
  const navLabels = document.querySelectorAll('[data-a="nav-label"]');
  const navBox = document.querySelectorAll('[data-a="box"]');

  if (!menuBtn || !overlay) return;

  let isOpen = false;

  let openTl = null;
  let closeTl = null;

  let titleSplits = [];
  let labelSplits = [];

  // store original HTML once
  [...navTitles, ...navLabels].forEach((el) => {
    if (!el.dataset.original) el.dataset.original = el.innerHTML;
  });

  function revertSplits() {
    titleSplits.forEach((s) => s.revert());
    labelSplits.forEach((s) => s.revert());
    titleSplits = [];
    labelSplits = [];
  }

  function killTimelines() {
    if (openTl) {
      openTl.kill();
      openTl = null;
    }
    if (closeTl) {
      closeTl.kill();
      closeTl = null;
    }
  }

  function createSplits() {
    // restore original first
    navTitles.forEach((el) => (el.innerHTML = el.dataset.original));
    navLabels.forEach((el) => (el.innerHTML = el.dataset.original));

    revertSplits();

    titleSplits = [...navTitles].map(
      (el) => new SplitText(el, { type: "lines", mask: "lines" })
    );
    labelSplits = [...navLabels].map(
      (el) => new SplitText(el, { type: "lines", mask: "lines" })
    );

    const titleLines = titleSplits.flatMap((s) => s.lines);
    const labelLines = labelSplits.flatMap((s) => s.lines);

    return { titleLines, labelLines };
  }

  function open() {
    killTimelines();

    openForm();

    menuBtn.classList.add("open");
    overlay.classList.add("open");

    const wrap = document.querySelector(".canvas-wrap");
    sketchManager.init(wrap);

    gsap.delayedCall(1, () => {
      sketchManager.animateMenuMeshes(true);
      sketchManager.animateMenuIntro();
    });

    const { titleLines, labelLines } = createSplits();

    // OPEN start state
    gsap.set([titleLines, labelLines], { y: "110%", opacity: 0 });
    gsap.set(lines, { scaleX: 0, opacity: 0, transformOrigin: "left center" });
    gsap.set(navBox, { scaleX: 0, transformOrigin: "left center" });

    openTl = gsap.timeline();

    openTl.fromTo(
      overlay,
      { y: "-100%" },
      {
        y: "0%",
        duration: 0.8,
        // ease: "cubic-bezier(.5, 1, .89, 1)",
        // ease: CustomEase.create("custom", "M0,0 C0.2,0 0.17,0.483 0.303,0.689 0.448,0.915 0.822,1 1,1 "),
        // ease: CustomEase.create("custom", "M0,0 C0.2,0 0.395,0.504 0.528,0.71 0.673,0.936 0.822,1 1,1 "),
        // ease: CustomEase.create("custom", "M0,0 C0.2,0 0.526,0.153 0.659,0.359 0.804,0.585 0.822,1 1,1 "),
        // ease: CustomEase.create("custom", "M0,0 C0.2,0 0.634,0.114 0.659,0.359 0.694,0.724 0.822,1 1,1 "),
        // ease: CustomEase.create("custom", "M0,0 C0.2,0 0.616,0.115 0.659,0.359 0.733,0.79 0.822,1 1,1 "),
        ease: CustomEase.create("custom", "M0,0 C0.2,0 0.616,0.115 0.659,0.359 0.733,0.79 0.588,0.97 1,1 "),
      },
      0
    );

    openTl.to(
      titleLines,
      {
        y: "0%",
        opacity: 1,
        duration: 1.2,
        stagger: 0.03,
        ease: "power3.out",
      },
      0.6
    );

    openTl.to(
      lines,
      {
        scaleX: 1,
        opacity: 1,
        duration: 1.2,
        stagger: { each: 0.1 },
        ease: "expo.out",
      },
      0.6
    );

    openTl.to(
      labelLines,
      {
        y: "0%",
        opacity: 1,
        duration: 1.4,
        stagger: 0.03,
        ease: "power3.out",
      },
      0.6
    );

    openTl.to(
      navBox,
      {
        scaleX: 1,
        duration: 1,
        stagger: 0.03,
        ease: "power3.out",
      },
      0.7
    );
  }

  function close() {
    killTimelines();


    const titleLines = titleSplits.flatMap((s) => s.lines);
    const labelLines = labelSplits.flatMap((s) => s.lines);

    const hasLines = titleLines.length || labelLines.length;


    sketchManager.animateMenuMeshes(false);

    closeTl = gsap.timeline({
      onComplete: () => {
        menuBtn.classList.remove("open");
        overlay.classList.remove("open");


        revertSplits();
        navTitles.forEach((el) => (el.innerHTML = el.dataset.original));
        navLabels.forEach((el) => (el.innerHTML = el.dataset.original));
      },
    });


    if (hasLines) {
      closeTl.to(
        [titleLines, labelLines],
        {
          y: "110%",
          opacity: 0,
          duration: 1.2,
          stagger: 0.02,
          ease: "expo.out",
        },
        0
      );
    }

    closeTl.to(
      lines,
      {
        scaleX: 0,
        opacity: 0,
        transformOrigin: 'right center',
        duration: 0.5,
        stagger: { each: 0.06, from: "end" },
        ease: "expo.out",
      },
      0
    );

    closeTl.to(
      navBox,
      {
        scaleX: 0,
        duration: 0.55,
        stagger: 0.02,
        ease: "power3.in",
      },
      0
    );

    closeTl.to(
      overlay,
      {
        y: "-100%",
        duration: 0.5,
        ease: CustomEase.create("custom", "M0,0 C0.2,0 0.616,0.115 0.659,0.359 0.733,0.79 0.588,0.97 1,1 "),
      },
      0.15
    );
  }

  menuBtn.addEventListener("click", () => {
    if (isOpen) close();
    else open();
    isOpen = !isOpen;
  });
}
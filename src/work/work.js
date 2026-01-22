// work.js
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

export default function workHome() {
  const root = document.querySelector(".project-observer");
  const line = document.querySelector(".project-ob-line");
  const titles = gsap.utils.toArray(".p-ob-item");       // left stacked titles
  const images = gsap.utils.toArray(".projects-item");   // middle list (ALL visible)

  if (!root || !line || !titles.length || !images.length) return;

  const count = Math.min(titles.length, images.length);
  const t = titles.slice(0, count);
  const im = images.slice(0, count);

  // stack titles: show only first
  gsap.set(t, { autoAlpha: 0 });
  gsap.set(t[0], { autoAlpha: 1 });

  let current = 0;
  let raf = null;

  const lineY = () => {
    const r = line.getBoundingClientRect();
    return r.top + r.height / 2;
  };

  const closestIndex = () => {
    const y = lineY();
    let best = 0;
    let bestDist = Infinity;

    for (let i = 0; i < im.length; i++) {
      const r = im[i].getBoundingClientRect();
      const cy = r.top + r.height / 2;
      const d = Math.abs(cy - y);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  };

  const show = (next) => {
    if (next === current) return;

    // keep it CLEAN: no timeline needed
    gsap.killTweensOf(t[current]);
    gsap.killTweensOf(t[next]);

    gsap.set(t[current], { autoAlpha: 0 });
    gsap.set(t[next], { autoAlpha: 1 });

    current = next;
  };

  const update = () => {
    raf = null;
    show(closestIndex());
  };

  const requestUpdate = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  // ✅ Observer just “listens” and triggers updates (doesn't turn it into a slider)
  const obs = Observer.create({
    target: window,
    type: "scroll,wheel,touch",
    preventDefault: false,
    onChange: requestUpdate,
    onStop: requestUpdate,
  });

  window.addEventListener("resize", requestUpdate);

  // initial sync (page could load mid-scroll)
  requestUpdate();

  return {
    refresh: requestUpdate,
    destroy: () => {
      obs.kill();
      window.removeEventListener("resize", requestUpdate);
      if (raf) cancelAnimationFrame(raf);
    },
  };
}
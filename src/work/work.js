// work.js
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

export default function workHome() {
  const root = document.querySelector(".project-observer");
  const line = document.querySelector(".project-ob-line");

  const titles = gsap.utils.toArray(".p-ob-item");
  const images = gsap.utils.toArray(".projects-item");

  if (!root || !line || !titles.length || !images.length) return;

  const count = Math.min(titles.length, images.length);
  const t = titles.slice(0, count);
  const im = images.slice(0, count);

  const pad2 = (n) => String(n).padStart(2, "0");

  // stack titles: show only first
  gsap.set(t, { autoAlpha: 0 });
  gsap.set(t[0], { autoAlpha: 1 });

  let current = 0;
  let raf = null;

  const updateNumbersForTitle = (idx) => {
    const title = t[idx];
    if (!title) return;

    const cp = title.querySelector('[data-a="cp"]');
    const fp = title.querySelector('[data-a="fp"]');

    if (cp) cp.textContent = pad2(idx + 1);
    if (fp) fp.textContent = pad2(count);
  };

  // init numbers for first title
  updateNumbersForTitle(0);

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

    gsap.set(t[current], { autoAlpha: 0 });
    gsap.set(t[next], { autoAlpha: 1 });

    current = next;

    // ✅ update numbers INSIDE active title
    updateNumbersForTitle(current);
  };

  const update = () => {
    raf = null;
    show(closestIndex());
  };

  const requestUpdate = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  const obs = Observer.create({
    target: window,
    type: "scroll,wheel,touch",
    preventDefault: false,
    onChange: requestUpdate,
    onStop: requestUpdate,
  });

  window.addEventListener("resize", requestUpdate);

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
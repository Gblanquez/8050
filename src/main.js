import "./styles/style.css";
import VoiceAgent from "./agent";
import sketchManager from "./sketch/sketch";
import LoadManager from "./sketch/load-manager";
import { startRAF, stopRAF } from "./scroll/scroll";
import { openMenu } from "./menu/menu";
import { loadPage } from "./load/load";
import linkUnderline from "./animations/linksU";
import workHome from "./work/work";
import { textIntro } from "./animations/textIntro";



const agent = new VoiceAgent({
  agentId: "agent_5201kab7gt2rek6ar2vv7kbr2ezw",
  buttonId: "start-agent",
});

document.addEventListener("DOMContentLoaded", () => {
  agent.init();
  // openMenu()
  // workHome()
  // loadPage()
  // linkUnderline()
  // startRAF()

  const wrap = document.querySelector(".home-main");
  sketchManager.init(wrap);

  // Background plane — comes in from y:110% with staggered corners, stays permanently
  const loader = new LoadManager(sketchManager.scene, sketchManager.camera);
  loader.init();

  // Expose for resize
  sketchManager._loader = loader;

  // Plane slides in, then reveal meshes + spin carousel + text
  loader.play(() => {
    sketchManager.animateMenuMeshes(true);
    sketchManager.animateMenuIntro();
    textIntro();
  });
});

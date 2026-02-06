import "./styles/style.css";
import VoiceAgent from "./agent";
import sketchManager from "./sketch/sketch";
import { startRAF, stopRAF } from "./scroll/scroll";
import { openMenu } from "./menu/menu";
import { loadPage } from "./load/load";
import linkUnderline from "./animations/linksU";
import workHome from "./work/work";



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
  startRAF()
  const wrap = document.querySelector(".home-main");
  sketchManager.init(wrap);
  sketchManager.animateMenuMeshes(true);


  console.log(sketchManager)
});




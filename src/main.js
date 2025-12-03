import "./styles/style.css";
import VoiceAgent from "./agent";
import sketchManager from "./sketch/sketch";
import { startRAF, stopRAF } from "./scroll/scroll";
import { openMenu } from "./menu/menu";
import { loadPage } from "./load/load";



const agent = new VoiceAgent({
  agentId: "agent_5201kab7gt2rek6ar2vv7kbr2ezw",
  buttonId: "start-agent",
});

document.addEventListener("DOMContentLoaded", () => {
  agent.init();
  openMenu()
  loadPage()
  
  startRAF()


  console.log(sketchManager)
});




import "./styles/style.css";
import VoiceAgent from "./agent";
import sketchManager from "./sketch/sketch";
import { startRAF, stopRAF } from "./scroll/scroll";




const agent = new VoiceAgent({
  agentId: "agent_5201kab7gt2rek6ar2vv7kbr2ezw",
  buttonId: "start-agent",
});

document.addEventListener("DOMContentLoaded", () => {
  agent.init();


  const wrap = document.querySelector('.canvas-wrap');
  sketchManager.init(wrap);
  
//   startRAF()


  console.log(sketchManager)
});




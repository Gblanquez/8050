import "./styles/style.css";
import VoiceAgent from "./agent";

const agent = new VoiceAgent({
  agentId: "agent_5201kab7gt2rek6ar2vv7kbr2ezw",
  buttonId: "start-agent",
});

document.addEventListener("DOMContentLoaded", () => {
  agent.init();
});

console.log("Hello from VS Code");
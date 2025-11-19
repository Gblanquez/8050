import './styles/style.css'
import VoiceAgent from './agent'


const agent = new VoiceAgent({
    agentId: "agent_7801kadt5gc9fr6sy6nexy6gpc56",
    buttonId: "start-agent",
    backendUrl: "https://8050-taupe.vercel.app/api/create-eleven-session"
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    agent.init();
  });

console.log('Hello from VS Code')

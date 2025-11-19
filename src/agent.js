export default class VoiceAgent {
    constructor({ agentId, buttonId, backendUrl }) {
      this.agentId = agentId;
      this.buttonId = buttonId;
      this.backendUrl = backendUrl;
  
      this.ws = null;
      this.audioCtx = null;
    }
  
    init() {
      const btn = document.getElementById(this.buttonId);
      if (!btn) {
        console.error(`VoiceAgent: Button #${this.buttonId} not found`);
        return;
      }
  
      btn.addEventListener("click", () => this.start());
    }
  
    async start() {
      const sessionRes = await fetch(this.backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: this.agentId,
        }),
      });
  
      const session = await sessionRes.json();
  
      if (!session.websocket_url) {
        console.error("Could not create session:", session);
        return;
      }
  
      this.ws = new WebSocket(session.websocket_url);
      this.ws.binaryType = "arraybuffer";
  
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (msg) => this.handleMessage(msg);
    }
  
    async handleOpen() {
      console.log("Connected to voice agent");
  
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mic = this.audioCtx.createMediaStreamSource(stream);
  
      const processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
  
      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          int16[i] = input[i] * 32767;
        }
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(int16);
        }
      };
  
      mic.connect(processor);
      processor.connect(this.audioCtx.destination);
    }
  
    async handleMessage(event) {
      try {
        const buffer = await this.audioCtx.decodeAudioData(event.data.slice(0));
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start();
      } catch (err) {
        console.error("Audio decode error", err);
      }
    }
  }
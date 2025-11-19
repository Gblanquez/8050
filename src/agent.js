import { Conversation } from "@elevenlabs/client";

export default class VoiceAgent {
  constructor({ agentId, buttonId }) {
    this.agentId = agentId;
    this.buttonId = buttonId;

    this.conversation = null;
    this.isStarting = false;
  }

  init() {
    const btn = document.getElementById(this.buttonId);
    if (!btn) {
      console.error(`VoiceAgent: Button #${this.buttonId} not found`);
      return;
    }

    btn.addEventListener("click", () => {
      if (this.conversation) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  async start() {
    if (this.isStarting || this.conversation) return;
    this.isStarting = true;

    try {
      // Ask for mic permission explicitly for UX
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const conversation = await Conversation.startSession({
        agentId: this.agentId,
        connectionType: "webrtc", // or "websocket", but webrtc handles audio nicely
        onConnect: () => {
          console.log("ElevenLabs agent connected");
        },
        onDisconnect: () => {
          console.log("ElevenLabs agent disconnected");
          this.conversation = null;
        },
        onError: (err) => {
          console.error("ElevenLabs conversation error:", err);
        },
        onMessage: (msg) => {
          // Text events, transcripts, etc.
          console.log("ElevenLabs event:", msg);
        },
      });

      this.conversation = conversation;
      console.log("Conversation started");
    } catch (err) {
      console.error("Failed to start ElevenLabs conversation:", err);
    } finally {
      this.isStarting = false;
    }
  }

  async stop() {
    if (!this.conversation) return;

    try {
      await this.conversation.endSession();
      console.log("Conversation ended");
    } catch (err) {
      console.error("Error ending conversation:", err);
    } finally {
      this.conversation = null;
    }
  }
}
import { useEffect, useRef, useState } from "react";
import RispostaWebhook from "./RispostaWebhook.jsx";
import AssistenteVarGroup from "./AssistenteVarGroup.jsx";


const N8N_URL = "https://valeriolorito.app.n8n.cloud/webhook/trascrizione";

export default function FaseTrascrizione() {
  const [micOn, setMicOn] = useState(false);
  const [chat, setChat] = useState(() => localStorage.getItem("conversazione") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [msg, setMsg] = useState("Premi il microfono e parla. Ti consiglierò live!");
  const recogRef = useRef(null);
  const aiRef = useRef();

  function addMessageToChat(text) {
    setChat((prev) => {
      const newChat = prev + "\n" + text;
      localStorage.setItem("conversazione", newChat);
      return newChat;
    });
  }

  function updateAISuggestions(suggArr) {
    if (!Array.isArray(suggArr)) suggArr = [suggArr];
    setSuggestions(suggArr.filter(Boolean));
    setTimeout(() => {
      if (aiRef.current) aiRef.current.scrollTop = aiRef.current.scrollHeight;
    }, 300);
  }

  function downloadChat() {
  const element = document.createElement("a");
  const file = new Blob([chat], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = "trascrizione_chat.txt";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMsg("API Web Speech non supportata su questo browser.");
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "it-IT";
    recog.continuous = true;
    recog.interimResults = false;
    recogRef.current = recog;
    recog.onend = () => micOn && recog.start();
    recog.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const tr = e.results[i][0].transcript;
        addMessageToChat(tr);
        fetch(N8N_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frase: tr, storico: chat + "\n" + tr }),
        })
          .then((resp) => resp.text())
          .then((data) => {
            let suggArr;
            try {
              suggArr = JSON.parse(data);
            } catch (err) {
              suggArr = [data];
            }
            updateAISuggestions(suggArr);
          })
          .catch((err) => console.error("Errore fetch:", err));
      }
    };
    return () => { recog.stop(); };
  }, [micOn, chat]);

  const startMic = () => {
    if (!micOn && recogRef.current) {
      setMicOn(true);
      recogRef.current.start();
      setMsg("🎤 Microfono attivo, parla ora...");
    }
  };

  const stopMic = () => {
    if (micOn && recogRef.current) {
      setMicOn(false);
      recogRef.current.stop();
      setMsg("Microfono disattivato.");
    }
  };

  const resetChat = () => {
    setChat("");
    setSuggestions([]);
    localStorage.removeItem("conversazione");
    setMsg("Conversazione azzerata. Premi il microfono per ricominciare!");
  };

  return (
    <div className="fase2-mobile">
      {/* Barra App style e titolo */}
      <div className="appbar-mobile">
        <span className="fase-title">Fase 2</span>
        <button className="btn-back-float" onClick={() => window.history.back()} title="Torna indietro">⟵</button>
      </div>
      {/* Stato del microfono */}
      <div className="mic-status-card glass-effect">
        <div className="mic-row">
          <button className={`mic-fab ${micOn ? "active" : ""}`} onClick={micOn ? stopMic : startMic}>
            {micOn ? "🛑" : "🎤"}
          </button>
          <span className="mic-status-text">{msg}</span>
        </div>
        <button className="btn-reset-small" onClick={resetChat}>↻ Reset</button>
        <button className="btn-export-small" onClick={downloadChat}>⬇️ Scarica trascrizione</button>
      </div>
      {/* Chat e AI card scorrevoli stile mobile */}
      <div className="main-cards-mobile">
        <div className="card-chat glass-effect">
          <div className="card-title">Chat</div>
          <div className="chat-log-mobile">
            {chat
              ? chat.split("\n").map((c, i) => c.trim() && <div className="chat-bubble" key={i}>{c}</div>)
              : <span className="empty-text">Nessuna conversazione</span>}
          </div>
        </div>
        <div className="card-ai glass-effect">
          <div className="card-title">Suggerimenti AI</div>
          <div className="ai-log-mobile" ref={aiRef}>
            {suggestions.length > 0
              ? suggestions.map((s, i) => <div className="ai-bubble" key={i}>{s}</div>)
              : <span className="empty-text">Nessun suggerimento</span>}
          </div>
        </div>
            </div>
      {/* Componenti aggiuntivi dopo le card principali */}
      <RispostaWebhook />
      <AssistenteVarGroup />
      {/* Floating workflow button */}
      <button className="btn-workflow-fab" onClick={() => window.history.back()}>
        Torna al workflow
      </button>
    </div>
  );
}

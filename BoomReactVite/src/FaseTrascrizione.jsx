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
  
  // Ref per tenere traccia dello stato *desiderato* (intent)
  // Questo risolve il problema dello "stale state" in onend
  const micOnRef = useRef(micOn);
  micOnRef.current = micOn;

  function updateAISuggestions(suggArr) {
    if (!Array.isArray(suggArr)) suggArr = [suggArr];
    setSuggestions(suggArr.filter(Boolean));
    setTimeout(() => {
      if (aiRef.current) aiRef.current.scrollTop = aiRef.current.scrollHeight;
    }, 300);
  }

  function downloadChat() {
    const element = document.createElement("a");
    const file = new Blob([chat], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "trascrizione_chat.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Questo useEffect viene eseguito UNA SOLA VOLTA al montaggio
  useEffect(() => {
    console.log("useEffect [Setup] eseguito.");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("API Web Speech non supportata.");
      setMsg("API Web Speech non supportata su questo browser.");
      return;
    }
    console.log("SpeechRecognition API supportata.");

    const recog = new SpeechRecognition();
    recog.lang = "it-IT";
    recog.continuous = true; // Prova a mantenerla continua
    recog.interimResults = false;
    recogRef.current = recog; // Salva l'istanza persistente

    recog.onstart = () => {
      console.log("Evento: onstart - Riconoscimento avviato.");
      setMsg("🎤 Microfono attivo, parla ora...");
    };

    recog.onend = () => {
      console.log("Evento: onend - Riconoscimento terminato.");
      // Controlla lo stato *desiderato* (micOnRef.current)
      if (micOnRef.current) {
        console.log("onend: Stato desiderato è 'on', tento riavvio...");
        try {
          recog.start(); // Riavvia se l'utente voleva il microfono acceso
        } catch (err) {
          console.error("Errore DENTRO onend durante recog.start():", err);
          setMicOn(false); // Se il riavvio fallisce, aggiorna lo stato
          setMsg("Errore riavvio microfono. Riprova.");
        }
      } else {
        // L'utente ha premuto stop, quindi è tutto normale
        console.log("onend: Stato desiderato è 'off'.");
        setMsg("Microfono disattivato.");
        setMicOn(false); // Sincronizza lo stato se non lo è già
      }
    };

    recog.onerror = (event) => {
      console.error("Evento: onerror - Errore riconoscimento:", event.error, event.message);
      setMsg(`Errore microfono: ${event.error}`);
      setMicOn(false); // Errore, forza lo stato a 'off'
    };

    recog.onresult = (e) => {
      console.log("Evento: onresult - Ricevuto risultato.");
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const tr = e.results[i][0].transcript;
        
        // Usa l'aggiornamento funzionale per evitare lo "stale state"
        setChat((prevChat) => {
          const newChat = prevChat + "\n" + tr;
          localStorage.setItem("conversazione", newChat);

          // Esegui il fetch QUI DENTRO, usando 'newChat'
          fetch(N8N_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Usa newChat per avere lo storico aggiornato
            body: JSON.stringify({ frase: tr, storico: newChat }),
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
          
          return newChat; // Ritorna il nuovo stato
        });
      }
    };

    // Cleanup: Chiamato solo quando il componente viene smontato
    return () => {
      console.log("Cleanup useEffect [Unmount]: Chiamo recog.stop().");
      if (recogRef.current) {
        recogRef.current.onend = null;
        recogRef.current.onerror = null;
        recogRef.current.onstart = null;
        recogRef.current.onresult = null;
        recogRef.current.stop();
      }
    };
  }, []); // <-- Array dipendenze VUOTO. Esegui solo una volta.

  const startMic = () => {
    console.log("startMic chiamato.");
    if (recogRef.current) {
      try {
        recogRef.current.start();
        setMicOn(true); // Imposta lo *stato desiderato* a 'on'
      } catch (err) {
        console.error("Errore DENTRO startMic durante recog.start():", err);
        setMsg("Errore avvio microfono.");
        setMicOn(false); // Fallito, imposta stato a 'off'
      }
    }
  };

  const stopMic = () => {
    console.log("stopMic chiamato.");
    if (recogRef.current) {
      setMicOn(false); // Imposta lo *stato desiderato* a 'off'
      recogRef.current.stop(); // Interrompi manualmente
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
      {/* Floating workflow button */}
      <button className="btn-workflow-fab" onClick={() => window.history.back()}>
        Torna al workflow
      </button>
    </div>
  );
}
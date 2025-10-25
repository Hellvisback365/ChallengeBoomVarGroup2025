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
    console.log("useEffect eseguito. micOn:", micOn); // Log inizio useEffect
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("API Web Speech non supportata."); // Log errore supporto
      setMsg("API Web Speech non supportata su questo browser.");
      return;
    }
    console.log("SpeechRecognition API supportata."); // Log supporto OK
    
    const recog = new SpeechRecognition();
    recog.lang = "it-IT";
    recog.continuous = true;
    recog.interimResults = false;
    recogRef.current = recog;

    recog.onstart = () => {
        console.log("Evento: onstart - Riconoscimento avviato."); // Log avvio
    };

    recog.onend = () => {
        console.log("Evento: onend - Riconoscimento terminato. Stato micOn:", micOn); // Log fine
        // Riprova a partire SOLO se micOn è ancora true
        if (micOn) {
            console.log("onend: micOn è true, tento recog.start().");
            try {
                recog.start();
            } catch (err) {
                console.error("Errore DENTRO onend durante recog.start():", err); // Log errore riavvio
                 setMicOn(false); // Forziamo lo stato off se non riparte
                 setMsg("Errore riavvio microfono. Riprova.");
            }
        }
    };

    recog.onerror = (event) => {
        console.error("Evento: onerror - Errore riconoscimento:", event.error, event.message); // Log ERRORE DETTAGLIATO
        setMsg(`Errore microfono: ${event.error}`);
        // Considera di fermare esplicitamente qui se necessario
        setMicOn(false); // Assicurati che lo stato rifletta l'errore
    };

    recog.onresult = (e) => {
      console.log("Evento: onresult - Ricevuto risultato."); // Log risultato
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
// Cleanup: Assicurati che stop venga chiamato quando il componente smonta o micOn cambia
    return () => {
        console.log("Cleanup useEffect: Chiamo recog.stop(). Stato micOn prima dello stop:", micOn); // Log cleanup
        if (recogRef.current) {
           recogRef.current.onend = null; // Disabilita onend prima di stoppare per evitare riavvii indesiderati
           recogRef.current.onerror = null;
           recogRef.current.onstart = null;
           recogRef.current.onresult = null;
           recogRef.current.stop();
           console.log("Cleanup useEffect: recog.stop() chiamato.");
        }
    };
    // Rimuovi 'chat' dalle dipendenze se non serve ricreare l'istanza recog ad ogni messaggio
  }, [micOn]);

  const startMic = () => {
    console.log("startMic chiamato. Stato micOn attuale:", micOn); // Log chiamata startMic
    if (!micOn && recogRef.current) {
        console.log("startMic: micOn è false e recogRef esiste. Tento recog.start().");
        try {
            recogRef.current.start();
            setMicOn(true); // Imposta true SOLO DOPO che start() non ha dato errori
            setMsg("🎤 Microfono attivo, parla ora...");
        } catch (err) {
            console.error("Errore DENTRO startMic durante recog.start():", err); // Log errore avvio
            setMsg("Errore avvio microfono.");
        }
    } else {
         console.log("startMic: condizione non soddisfatta (micOn:", micOn, "recogRef:", !!recogRef.current, ")");
    }
  };

  const stopMic = () => {
    console.log("stopMic chiamato. Stato micOn attuale:", micOn); // Log chiamata stopMic
    if (micOn && recogRef.current) {
      console.log("stopMic: micOn è true e recogRef esiste. Chiamo recog.stop().");
      recogRef.current.stop(); // Chiama stop prima di cambiare stato
      setMicOn(false); // Aggiorna stato dopo
      setMsg("Microfono disattivato.");
    } else {
        console.log("stopMic: condizione non soddisfatta (micOn:", micOn, "recogRef:", !!recogRef.current, ")");
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

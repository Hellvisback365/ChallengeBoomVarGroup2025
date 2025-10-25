import { useEffect, useRef, useState } from "react";
import AssistenteVarGroup from "./AssistenteVarGroup.jsx";

const N8N_URL = "https://valeriolorito.app.n8n.cloud/webhook/trascrizione";
const REPORT_URL = "https://valeriolorito.app.n8n.cloud/webhook/65f8138c-33a7-4d41-8adf-4991b675cc48";

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

  // Modal stato per Carica Trascrizione
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [nomeConsulente, setNomeConsulente] = useState("");
  const [nomeAzienda, setNomeAzienda] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // Converte l'intera trascrizione in markdown semplice (bullet list per ogni riga)
  function toMarkdownTranscript(testo) {
    if (!testo) return " Nessuna trascrizione disponibile. ";
    return testo
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => `- ${r}`)
      .join("\n");
  }

  async function handleUploadTranscript() {
    if (!nomeConsulente.trim() || !nomeAzienda.trim()) return;
    setUploadLoading(true);
    setUploadStatus("");
    try {
      const trascrizioneMarkdown = toMarkdownTranscript(chat);
      // Data corrente in formato gg.mm.aaaa
      const now = new Date();
      const data = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

      // Invia come multipart/form-data (consistente con CaricaReport)
    const formData = new FormData();
  formData.append('exportMarkdown', trascrizioneMarkdown);
  formData.append('consultantName', nomeConsulente.toUpperCase());
  formData.append('companyName', nomeAzienda.toUpperCase());
      formData.append('data', data);
      formData.append('isNew', 0);

      await fetch(REPORT_URL, {
        method: 'POST',
        body: formData,
      });
      setUploadStatus("Trascrizione inviata con successo.");
    } catch (err) {
      setUploadStatus("Errore durante l'invio della trascrizione.");
    }
    setUploadLoading(false);
    setShowTranscriptModal(false);
    setNomeConsulente("");
    setNomeAzienda("");
    setTimeout(() => setUploadStatus(""), 8000);
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
        <button
          className={`btn-export-small ${!chat || !chat.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setShowTranscriptModal(true)}
          disabled={!chat || !chat.trim()}
          title={!chat || !chat.trim() ? 'Nessun testo trascritto' : 'Apri Carica Trascrizione'}
        >
          📤 Carica Trascrizione
        </button>
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
      {uploadStatus && (
        <div className="main-cards-mobile">
          <div className="glass-effect card-chat" style={{ maxWidth: 500, margin: "1em auto", padding: "0.8em 1.2em", color: uploadStatus.includes('successo') ? '#2ec883' : '#ff4d4f' }}>
            {uploadStatus}
          </div>
        </div>
      )}
      {/* Modal stile banner per Carica Trascrizione */}
      {showTranscriptModal && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 shadow-lg mx-4 mt-4 rounded-lg">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="ml-0 flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800">Carica Trascrizione</h3>
                  <p className="text-sm text-yellow-700 mt-1">Inserisci i dati per inviare la trascrizione corrente</p>
                </div>
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  disabled={uploadLoading}
                  className="text-yellow-400 hover:text-yellow-600"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome Consulente</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={nomeConsulente}
                    onChange={(e) => setNomeConsulente(e.target.value)}
                    placeholder="Mario Rossi"
                    disabled={uploadLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Azienda</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={nomeAzienda}
                    onChange={(e) => setNomeAzienda(e.target.value)}
                    placeholder="VarGroup"
                    disabled={uploadLoading}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-60 font-semibold shadow"
                    onClick={handleUploadTranscript}
                    disabled={uploadLoading || !nomeConsulente.trim() || !nomeAzienda.trim()}
                  >
                    {uploadLoading ? "Invio..." : "Carica Trascrizione"}
                  </button>
                  <button
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                    onClick={() => setShowTranscriptModal(false)}
                    disabled={uploadLoading}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating workflow button */}
      <button className="btn-workflow-fab" onClick={() => window.history.back()}>
        Torna al workflow
      </button>
    </div>
  );
}
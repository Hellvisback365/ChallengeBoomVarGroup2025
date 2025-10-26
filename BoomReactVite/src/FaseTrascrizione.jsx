import { useEffect, useRef, useState } from "react";
import AssistenteVarGroup from "./AssistenteVarGroup.jsx";
import ReturnToWorkflowButton from "./ReturnToWorkflowButton.jsx";

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

  // Converte l'intera trascrizione in markdown
  // - Se NON contiene elementi di formattazione markdown, restituisce un unico elemento "body: ..."
  // - Se contiene già markdown, restituisce il testo così com'è
  function toMarkdownTranscript(testo) {
    if (!testo) return " Nessuna trascrizione disponibile. ";
    const raw = testo.trim();
    const hasMarkdown = /(^#\s|^##\s|^###\s|\*\*.+?\*\*|\*.+?\*|^\s*[-*]\s|^\s*\d+\.\s)/m.test(raw);
    if (!hasMarkdown) {
      return `body: ${raw}`;
    }
    return raw;
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

      const res = await fetch(REPORT_URL, {
        method: 'POST',
        body: formData,
      });
      const text = (await res.text()).trim();
      if (text === "La consulenza non esiste, hai effettuato una trascrizione di una consulenza ancora non documentata?") {
        setUploadStatus(text);
      } else if (text === "Trascrizione inserita!") {
        setUploadStatus(
          "Trascrizione inserita! Trovi la tua trascrizione in https://drive.google.com/drive/folders/1qF7B1O1XoqNQ-069_ZY6GZAoOunOmA9Z?usp=drive_link, nella cartella apposita!"
        );
      } else {
        setUploadStatus(text || "Trascrizione inviata.");
      }
    } catch (err) {
      setUploadStatus("Errore durante l'invio della trascrizione.");
    }
    setUploadLoading(false);
    setShowTranscriptModal(false);
    setNomeConsulente("");
    setNomeAzienda("");
    setTimeout(() => setUploadStatus(""), 8000);
  }

  // Rende cliccabili eventuali URL nel messaggio di stato
  function linkifyStatus(text) {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={`link-${idx}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 underline cursor-pointer hover:text-gray-600"
          >
            {part}
          </a>
        );
      }
      return <span key={`text-${idx}`}>{part}</span>;
    });
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
          const previousChat = prevChat; // Chat antes del nuovo inserimento
          const newChat = prevChat + "\n" + tr;
          localStorage.setItem("conversazione", newChat);
          // Esegui il fetch QUI DENTRO, usando 'previousChat' come storico
          fetch(N8N_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Usa previousChat per avere lo storico aggiornato SENZA ultimo tr
            body: JSON.stringify({ frase: tr, storico: previousChat }),
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
    <div className="min-h-screen bg-gray-700 text-gray-100 font-sans antialiased relative overflow-hidden">
      
      {/* Barra App style e titolo */}
      <div className="flex items-center justify-between p-4 bg-gray-800 shadow-custom-dark border-b border-gray-800 animate-slide-in-top">
        <span className="text-3xl font-bold text-white tracking-wide">Fase 2</span>
      </div>
      <p className="text-gray-300 mb-6 text-center text-lg italic animate-fade-in px-6">Acquisisci e analizza conversazioni in tempo reale con il supporto AI.</p>
      {/* Stato del microfono */}
      <div className="bg-gray-800 border border-gray-800 rounded-2xl p-5 m-6 flex flex-col gap-3 shadow-custom-dark animate-fade-in">
        <div className="flex items-center gap-4">
          <button className={`p-4 rounded-full shadow-interactive transition-all duration-300 ${micOn ? "bg-red-600 hover:bg-red-700 text-white animate-glow-pulse" : "bg-gray-800 hover:bg-gray-700 text-white"} text-4xl`} onClick={micOn ? stopMic : startMic}>
            {micOn ? "🛑" : "🎤"}
          </button>
          <span className="font-medium text-xl text-white">{msg}</span>
        </div>
        <button className="self-end text-white hover:text-gray-600 transition-colors duration-200 text-lg font-semibold px-4 py-2 rounded-xl hover:bg-gray-800" onClick={resetChat}>↻ Reset</button>
        <button
          className={`bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-300 shadow-interactive ${!chat || !chat.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setShowTranscriptModal(true)}
          disabled={!chat || !chat.trim()}
          title={!chat || !chat.trim() ? 'Nessun testo trascritto' : 'Apri Carica Trascrizione'}
        >
          📤 Carica Trascrizione
        </button>
      </div>
      {/* Chat e AI card scorrevoli */}
      <div className="flex flex-col md:flex-row gap-6 m-6 animate-fade-in">
        <div className="flex-1 bg-gray-800 border border-gray-800 rounded-2xl shadow-custom-dark min-h-[220px] p-5">
          <div className="text-2xl font-bold text-white mb-3">Chat</div>
          <div className="min-h-[80px] max-h-52 overflow-y-auto flex flex-col gap-2 p-2 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
            {chat
              ? chat.split("\n").map((c, i) => c.trim() && <div className="self-end bg-gray-800 text-white rounded-xl px-4 py-2 text-base max-w-[85%] shadow-md animate-slide-in-top" key={i}>{c}</div>)
              : <span className="text-white italic">Nessuna conversazione</span>}
          </div>
        </div>
        <div className="flex-1 bg-gray-800 border border-gray-800 rounded-2xl shadow-custom-dark min-h-[220px] p-5">
          <div className="text-2xl font-bold text-white mb-3">Suggerimenti AI</div>
          <div className="min-h-[80px] max-h-52 overflow-y-auto flex flex-col gap-2 p-2 bg-gray-800 rounded-lg shadow-inner border border-gray-700" ref={aiRef}>
            {suggestions.length > 0
              ? suggestions.map((s, i) => <div className="self-start bg-gray-700 text-white rounded-xl px-4 py-2 text-base max-w-[85%] shadow-md animate-slide-in-top" key={i}>{s}</div>)
              : <span className="text-white italic">Nessun suggerimento</span>}
          </div>
        </div>
      </div>
      {/* Componenti aggiuntivi dopo le card principali */}
      {uploadStatus && (
        <div className="m-6 animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-custom-light max-w-xl mx-auto p-4 text-center text-base"
            style={{ color: uploadStatus.includes('successo') ? '#4ade80' : '#ef4444' }}>
            {linkifyStatus(uploadStatus)}
          </div>
        </div>
      )}
      {/* Modal per Carica Trascrizione */}
      {showTranscriptModal && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800 border border-gray-800 rounded-2xl shadow-custom-dark max-w-lg w-full mx-auto p-8 relative animate-slide-in-top">
            <div className="flex items-start mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white">Carica Trascrizione</h3>
                <p className="text-sm text-white mt-2">Inserisci i dati per inviare la trascrizione corrente</p>
              </div>
              <button
                onClick={() => setShowTranscriptModal(false)}
                disabled={uploadLoading}
                className="text-gray-400 hover:text-gray-200 transition-colors text-lg"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nome e Cognome Consulente</label>
                <input
                  className="w-full border border-gray-700 rounded-xl px-4 py-2 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  value={nomeConsulente}
                  onChange={(e) => setNomeConsulente(e.target.value)}
                  placeholder="Mario Rossi"
                  disabled={uploadLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nome Azienda Consulenza</label>
                <input
                  className="w-full border border-gray-700 rounded-xl px-4 py-2 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  value={nomeAzienda}
                  onChange={(e) => setNomeAzienda(e.target.value)}
                  placeholder="VarGroup"
                  disabled={uploadLoading}
                />
              </div>
              <div className="flex gap-4 pt-3">
                <button
                  className="flex-1 bg-gray-800 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-60 font-semibold shadow-interactive transition-all duration-300"
                  onClick={handleUploadTranscript}
                  disabled={uploadLoading || !nomeConsulente.trim() || !nomeAzienda.trim()}
                >
                  {uploadLoading ? "Invio..." : "Carica Trascrizione"}
                </button>
                <button
                  className="flex-1 bg-gray-700 text-gray-100 px-5 py-2.5 rounded-xl hover:bg-gray-600 font-semibold shadow-sm transition-all duration-300"
                  onClick={() => setShowTranscriptModal(false)}
                  disabled={uploadLoading}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ReturnToWorkflowButton />
    </div>
  );
}
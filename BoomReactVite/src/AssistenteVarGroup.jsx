import React, { useState, useRef, useEffect } from "react";
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const VARGROUP_URL = "https://valeriolorito.app.n8n.cloud/webhook/a9c35145-cfc7-4b7e-82b0-2ac19d93c3d0/chat";
const REPORT_URL = "https://valeriolorito.app.n8n.cloud/webhook/65f8138c-33a7-4d41-8adf-4991b675cc48";

// Genera un ID univoco di sessione
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Formatta il testo del chatbot in struttura report
function formatReportText(text) {
  if (!text) return text;
  
  // Converti markdown-like formatting in HTML strutturato
  let formatted = text
    // Header H1 (# Titolo)
    .replace(/^# (.+)$/gm, '<h1 style="font-size: 1.5em; font-weight: bold; margin: 0.8em 0 0.4em 0; color: #23d7fc;">$1</h1>')
    // Header H2 (## Sottotitolo)
    .replace(/^## (.+)$/gm, '<h2 style="font-size: 1.3em; font-weight: bold; margin: 0.7em 0 0.3em 0; color: #38e99a;">$1</h2>')
    // Header H3 (### Sezione)
    .replace(/^### (.+)$/gm, '<h3 style="font-size: 1.1em; font-weight: bold; margin: 0.6em 0 0.2em 0; color: #fff;">$1</h3>')
    // Header H4 (#### Sottoparagrafo) - più piccolo e indentato
    .replace(/^#### (.+)$/gm, '<h4 style="font-size: 1em; font-weight: 600; margin: 0.5em 0 0.2em 1em; color: #ddd;">$1</h4>')
    // Grassetto (**testo**)
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: bold; color: #fff;">$1</strong>')
    // Corsivo (*testo*)
    .replace(/\*(.+?)\*/g, '<em style="font-style: italic;">$1</em>')
    // Liste puntate (- item o * item)
    .replace(/^[*-] (.+)$/gm, '<li style="margin-left: 1.5em; margin-bottom: 0.3em;">$1</li>')
    // Liste numerate (1. item)
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-left: 1.5em; margin-bottom: 0.3em; list-style-type: decimal;">$1</li>')
    // Paragrafi (righe vuote)
    .replace(/\n\n/g, '<br/><br/>');
  
  return formatted;
}

export default function AssistenteVarGroup() {
  // ID sessione persistente - inizializzato una sola volta
  const sessionIdRef = useRef(null);
  
  // Inizializza sessionId e pulisci chat se è una nuova sessione
  const [chat, setChat] = useState(() => {
    const storedSessionId = localStorage.getItem("chatSessionId");
    const newSessionId = generateSessionId();
    
    // Se non c'è sessionId o è diverso, è una nuova sessione
    if (!storedSessionId || storedSessionId !== sessionIdRef.current) {
      sessionIdRef.current = newSessionId;
      localStorage.setItem("chatSessionId", newSessionId);
      localStorage.removeItem("chatVarGroup"); // Pulisci la chat precedente
      return [];
    }
    
    sessionIdRef.current = storedSessionId;
    return JSON.parse(localStorage.getItem("chatVarGroup") || "[]");
  });
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState("");
  const [reportUrl, setReportUrl] = useState(""); // URL del report generato
  // Stato per modal e campi report
  const [showReportModal, setShowReportModal] = useState(false);
  const [consultantName, setConsultantName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatVarGroup", JSON.stringify(chat));
    setReportStatus("");
    // scroll alla fine chat
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  createChat({
    webhookUrl: 'https://valeriolorito.app.n8n.cloud/webhook/a9c35145-cfc7-4b7e-82b0-2ac19d93c3d0',
    webhookConfig: {
      method: 'POST',
      headers: {}
    },
    chatInputKey: 'chatInput',
    chatSessionKey: 'sessionId',
    metadata: {},
    mode: 'window',
    showWelcomeScreen: false,
    initialMessages: ['Ciao! Come posso aiutarti?']
  });

  const inviaMessaggio = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const nuovoMessaggio = { ruolo: "utente", testo: input };
    setChat(prev => [...prev, nuovoMessaggio]);
    try {
      const res = await fetch(VARGROUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "sendMessage",  // ← FONDAMENTALE: dice all'AI Agent di processare il messaggio
          chatInput: input, 
          sessionId: sessionIdRef.current
        })
      });
      
      const data = await res.json(); // ← Cambiato da .text() a .json()
      const risposta = data.output || data.text || "Nessuna risposta"; // ← L'AI Agent restituisce { output: "..." }
      
      setChat(prev => [...prev, { ruolo: "AI", testo: risposta }]);
      setInput("");
    } catch (err) {
      console.error("Errore:", err); // ← Aggiungi log per debug
      setChat(prev => [...prev, { ruolo: "AI", testo: "Errore nell'assistente." }]);
    }
    setLoading(false);
  };

  // Apre il modal per Carica Report
  const report = () => {
    setShowReportModal(true);
  };

  // Invia i dati del report al webhook N8N
  const handleSubmitReport = async () => {
    if (!consultantName.trim() || !companyName.trim()) return;
    setReportLoading(true);
    try {
      const ultimoMessaggio = chat.slice(-1)[0]?.testo || "";
      const storicoChat = chat.map(x => x.testo).join("\n");
      
      // Data corrente in formato gg.mm.aaaa
      const now = new Date();
      const data = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
      
      const res = await fetch(REPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ultimoMessaggio,
          storico: storicoChat,
          consultantName: consultantName.toUpperCase(), // Nome in uppercase
          companyName,
          data, // Data corrente
        }),
      });
      const risposta = await res.text();
      setReportUrl(risposta); // Salva l'URL ricevuto
      setReportStatus("Report generato con successo! Trovi il file nella cartella: ");
    } catch (err) {
      setReportStatus("Errore invio report.");
      setReportUrl("");
    }
    setReportLoading(false);
    setShowReportModal(false);
    setConsultantName("");
    setCompanyName("");
    setTimeout(() => {
      setReportStatus("");
      setReportUrl("");
    }, 10000); // Mostra URL per 10 secondi
  };

  return (
    <div className="main-cards-mobile">
      <div className="glass-effect card-ai" style={{ maxWidth: 530, margin: "2em auto", padding: "1.5em" }}>
        <div className="card-title">Assistente VarGroup</div>
        <div ref={chatRef} style={{
          background: "#232532",
          height: 200,
          overflowY: "auto",
          borderRadius: "8px",
          padding: "1em",
          marginBottom: "1em"
        }}>
          {chat.length === 0 && (
            <div style={{ color: "#888" }}>Ciao! Sono l'assistente VarGroup. Come posso aiutarti?</div>
          )}
          {chat.map((m, i) => (
            <div key={i} style={{
              textAlign: m.ruolo === "utente" ? "right" : "left",
              marginBottom: 8,
            }}>
              <span style={{
                display: "inline-block",
                background: m.ruolo === "utente" ? "#23d7fc" : "#38e99a",
                color: "#fff",
                borderRadius: "12px",
                padding: "6px 16px",
                maxWidth: "90%",
                wordBreak: "break-word",
                boxShadow: "0 2px 9px #2ec88344",
                textAlign: "left"
              }}>
                {m.ruolo === "AI" ? (
                  <div dangerouslySetInnerHTML={{ __html: formatReportText(m.testo) }} />
                ) : (
                  m.testo
                )}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input
            type="text"
            value={input}
            className="vargroup-input"
            style={{ flex: 1, borderRadius: "12px", border: "none", padding: "10px" }}
            placeholder="Scrivi qui..."
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" ? inviaMessaggio() : null}
          />
          <button className="btn-main" disabled={loading || !input.trim()} onClick={inviaMessaggio}>
            {loading ? "Invio..." : "Invia"}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            className={`btn-main ${chat.some(m => m.ruolo === 'AI') ? '' : 'opacity-50 cursor-not-allowed'}`}
            onClick={report}
            disabled={!chat.some(m => m.ruolo === 'AI')}
          >
            Carica Report
          </button>
        </div>
        {reportStatus && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: "#2ec883", marginBottom: 4 }}>
              {reportStatus}
              {reportStatus.includes("successo") && (
                <a 
                  href="https://drive.google.com/drive/folders/1f-f4SpflPnPP6LHd0Z4a82Z0Tu9lyTr6?usp=drive_link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: "#23d7fc", 
                    textDecoration: "underline",
                    cursor: "pointer"
                  }}
                >
                  Google Drive
                </a>
              )}
            </div>
            {reportUrl && (
              <a 
                href={reportUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: "#23d7fc", 
                  textDecoration: "underline",
                  cursor: "pointer",
                  wordBreak: "break-all"
                }}
              >
                {reportUrl}
              </a>
            )}
          </div>
        )}
      </div>
      {/* Modal Pop-up per Carica Report - Stile Banner Warning */}
      {showReportModal && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 shadow-lg mx-4 mt-4 rounded-lg">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800">Carica Report</h3>
                  <p className="text-sm text-yellow-700 mt-1">Inserisci i dati per generare il report</p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  disabled={reportLoading}
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
                    value={consultantName}
                    onChange={(e) => setConsultantName(e.target.value)}
                    placeholder="Mario Rossi"
                    disabled={reportLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Azienda</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="VarGroup"
                    disabled={reportLoading}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-60 font-semibold shadow"
                    onClick={handleSubmitReport}
                    disabled={reportLoading || !consultantName.trim() || !companyName.trim()}
                  >
                    {reportLoading ? "Invio..." : "Invia Report"}
                  </button>
                  <button
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                    onClick={() => setShowReportModal(false)}
                    disabled={reportLoading}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
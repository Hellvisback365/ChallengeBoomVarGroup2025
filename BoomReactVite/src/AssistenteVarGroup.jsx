import React, { useState, useRef, useEffect } from "react";
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const VARGROUP_URL = "https://example-n8n-instance.com/webhook/YOUR_CHAT_WEBHOOK_TOKEN_HERE/chat";
const REPORT_URL = "https://example-n8n-instance.com/webhook/YOUR_REPORT_WEBHOOK_TOKEN_HERE";

// Genera un ID univoco di sessione
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Formatta il testo markdown in HTML per la visualizzazione
function formatReportText(text) {
  if (!text) return text;
  
  // Converti markdown in HTML strutturato
  let formatted = text
    // Header H1 (# Titolo)
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-3 mb-1 text-gray-500">$1</h1>')
    // Header H2 (## Sottotitolo)
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-2.5 mb-0.5 text-gray-400">$1</h2>')
    // Header H3 (### Sezione)
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-2 mb-0.5 text-gray-100">$1</h3>')
    // Header H4 (#### Sottoparagrafo)
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-1 mb-0.5 ml-4 text-gray-200">$1</h4>')
    // Grassetto (**testo**)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-50">$1</strong>')
    // Corsivo (*testo*)
    .replace(/\*([^*]+?)\*/g, '<em class="italic">$1</em>')
    // Liste puntate (- item)
    .replace(/^- (.+)$/gm, '<li class="ml-6 mb-1 text-gray-200">$1</li>')
    // Paragrafi (doppia newline -> doppio <br>)
    .replace(/\n\n/g, '<br/><br/>')
    // Singola newline -> singolo <br>
    .replace(/\n/g, '<br/>');
  
  return formatted;
}

// Converte il testo in markdown standard (rimuove HTML se presente e normalizza)
// Mantiene tutte le formattazioni: headers, grassetto, corsivo, liste, a capo
function toMarkdownStructure(text) {
  if (!text) return text;
  
  let md = text
    // Converti headers HTML in markdown (se presenti)
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1')
    // Converti grassetto
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Converti corsivo
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Converti liste
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
    // Rimuovi tag <br> multipli e converti in doppia newline (paragrafo)
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
    // Rimuovi singoli <br> e converti in newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Rimuovi altri tag HTML rimanenti
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Converti elenchi numerati in elenchi puntati
    .replace(/^\s*\d+\.\s+/gm, '- ')
    // Normalizza CRLF -> LF
    .replace(/\r\n/g, '\n')
    // Rimuovi spazi multipli (ma non a inizio riga per indentazione)
    .replace(/[^\S\r\n]{2,}/g, ' ')
    // Pulisci newline multiple eccessive (max 2)
    .replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

// Rende cliccabili eventuali URL di Google Drive nel testo della risposta
function linkifyText(text) {
  if (!text) return null;
  const driveUrlRegex = /(https?:\/\/drive\.google\.com\/[^\s]+)/g;
  const parts = text.split(driveUrlRegex);
  
  return (
    <>
      {parts.map((part, idx) => {
        if (part.match(driveUrlRegex)) {
          return (
            <a
              key={`link-${idx}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline cursor-pointer hover:text-blue-300"
            >
              {part}
            </a>
          );
        }
        return <span key={`text-${idx}`}>{part}</span>;
      })}
    </>
  );
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

  const inviaMessaggio = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const nuovoMessaggio = { ruolo: "utente", testo: input };
    setChat(prev => [...prev, nuovoMessaggio]);
    // Svuota subito il campo input appena invii
    setInput("");
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
      const ultimoMessaggioMarkdown = toMarkdownStructure(ultimoMessaggio);
      const storicoChat = chat.map(x => x.testo).join("\n");
      
      // Data corrente in formato gg.mm.aaaa
      const now = new Date();
      const data = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
      
      // Prepara multipart/form-data con file binario contenente il markdown
      const formData = new FormData();
  formData.append('ultimoMessaggio', ultimoMessaggio);
  formData.append('exportMarkdown', ultimoMessaggioMarkdown);
      formData.append('storico', storicoChat);
      formData.append('consultantName', consultantName.toUpperCase());
  formData.append('companyName', companyName.toUpperCase());
  // isNew come numero (JS number). Nei form-data verrà serializzato come "1" ma
  // il tipo sorgente è numerico per consentire parsing numerico lato server.
  formData.append('isNew', 1);
  formData.append('data', data);
    
      const res = await fetch(REPORT_URL, {
        method: "POST",
        body: formData, // Non impostare manualmente Content-Type: il browser aggiunge boundary
      });
      const risposta = await res.text();
      // Mostra l'intera risposta del server
      setReportStatus(risposta || "Report inviato con successo!");
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
    <div className="w-full font-sans antialiased text-gray-100">
      <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800 rounded-2xl shadow-custom-dark border border-gray-700 animate-slide-in-top">
        <div className="text-3xl font-bold text-white mb-1 text-center">Ricerca e analisi aziendale</div>
        <div className="text-sm text-gray-400 mb-5 text-center">con Zenith-Research</div>
        <p className="text-gray-300 mb-6 text-center text-lg italic animate-fade-in">Dammi le informazioni sull'azienda e sulla consulenza e scriverò un report dettagliato.</p>
        <div ref={chatRef}
          className="bg-gray-700 h-96 overflow-y-auto rounded-xl p-4 mb-6 text-gray-100 border border-gray-600 shadow-inner"
        >
          {chat.length === 0 && (
            <div className="text-gray-300 italic">Ciao! Sono <span className="font-semibold text-gray-100">Zenith-Research</span>. Come posso aiutarti?</div>
          )}
          {chat.map((m, i) => (
            <div key={i} className={`mb-3 ${m.ruolo === "utente" ? "text-right" : "text-left"} animate-fade-in`}>
              <span className={`inline-block rounded-xl px-5 py-2.5 max-w-[90%] break-words shadow-md text-sm md:text-base ${m.ruolo === "utente" ? "bg-gray-700 text-white" : "bg-gray-600 text-gray-100"}`}>
                {m.ruolo === "AI" ? (
                  <div dangerouslySetInnerHTML={{ __html: formatReportText(m.testo) }} />
                ) : (
                  m.testo
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={input}
            className="flex-1 rounded-xl border border-gray-600 px-4 py-2 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
            placeholder="Scrivi qui..."
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" ? inviaMessaggio() : null}
          />
          <button className="bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-interactive" disabled={loading || !input.trim()} onClick={inviaMessaggio}>
            {loading ? "Invio..." : "Invia"}
          </button>
        </div>
        <div className="flex gap-3 mb-6">
          <button
            className={`flex-1 bg-gray-600 text-gray-100 px-4 py-2 rounded-xl font-semibold hover:bg-gray-500 transition-all duration-300 shadow-sm ${chat.some(m => m.ruolo === 'AI') ? '' : 'opacity-50 cursor-not-allowed'}`}
            onClick={report}
            disabled={!chat.some(m => m.ruolo === 'AI')}
          >
            Carica Report
          </button>
        </div>
        {reportStatus && (
          <div className="mb-4 text-center animate-fade-in">
            <div className={`mb-2 text-sm md:text-base ${reportStatus.includes("successo") || reportStatus.includes("Success") || reportStatus.includes("drive.google.com") ? "text-green-500" : "text-red-500"}`}>
              {linkifyText(reportStatus)}
            </div>
          </div>
        )}
        {/* Modal Pop-up per Carica Report */}
        {showReportModal && (
          <div className="fixed inset-0 bg-gray-950 bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-custom-dark max-w-lg w-full mx-auto p-8 relative animate-slide-in-top">
              <div className="flex items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-50">Carica Report</h3>
                  <p className="text-sm text-gray-300 mt-2">Inserisci i dati per generare il report</p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  disabled={reportLoading}
                  className="text-gray-400 hover:text-gray-200 transition-colors text-lg"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Nome e Cognome Consulente</label>
                  <input
                    className="w-full border border-gray-600 rounded-xl px-4 py-2 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                    value={consultantName}
                    onChange={(e) => setConsultantName(e.target.value)}
                    placeholder="Mario Rossi"
                    disabled={reportLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Nome Azienda</label>
                  <input
                    className="w-full border border-gray-600 rounded-xl px-4 py-2 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="VarGroup"
                    disabled={reportLoading}
                  />
                </div>
                <div className="flex gap-4 pt-3">
                  <button
                    className="flex-1 bg-gray-700 text-white px-5 py-2.5 rounded-xl hover:bg-gray-600 disabled:opacity-60 font-semibold shadow-interactive transition-all duration-300"
                    onClick={handleSubmitReport}
                    disabled={reportLoading || !consultantName.trim() || !companyName.trim()}
                  >
                    {reportLoading ? "Invio..." : "Invia Report"}
                  </button>
                  <button
                    className="flex-1 bg-gray-600 text-gray-100 px-5 py-2.5 rounded-xl hover:bg-gray-500 font-semibold shadow-sm transition-all duration-300"
                    onClick={() => setShowReportModal(false)}
                    disabled={reportLoading}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
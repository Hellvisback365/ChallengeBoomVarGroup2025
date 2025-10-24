import React, { useState, useRef, useEffect } from "react";

const VARGROUP_URL = "https://valeriolorito.app.n8n.cloud/webhook/ff2a7c52-356d-4ec5-b9a4-8ae14f88650b";
export default function AssistenteVarGroup() {
  const [chat, setChat] = useState(() => JSON.parse(localStorage.getItem("chatVarGroup") || "[]"));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState("");
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
    try {
      const res = await fetch(VARGROUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testo: input, storico: chat.map(x => x.testo).join("\n") })
      });
      const risposta = await res.text();
      setChat(prev => [...prev, { ruolo: "AI", testo: risposta }]);
      setInput("");
    } catch (err) {
      setChat(prev => [...prev, { ruolo: "AI", testo: "Errore nell'assistente." }]);
    }
    setLoading(false);
  };

  const salvaChat = () => {
    localStorage.setItem("chatVarGroup", JSON.stringify(chat));
    setReportStatus("Chat salvata!");
    setTimeout(()=>setReportStatus(""),1500);
  };

  const esportaChat = () => {
    const testo = chat.map(m => `${m.ruolo === "utente" ? "Utente" : "AI"}: ${m.testo}`).join("\n");
    const element = document.createElement("a");
    element.href = URL.createObjectURL(new Blob([testo], {type:"text/plain"}));
    element.download = "chat-vargroup.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const report = async () => {
    setReportStatus("Invio in corso...");
    try {
      const ultimo = chat.filter(m => m.ruolo === "utente").slice(-1)[0]?.testo || "";
      const res = await fetch(VARGROUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testo: ultimo, storico: chat.map(x => x.testo).join("\n") })
      });
      const risposta = await res.text();
      setReportStatus("Report inviato! Risposta: " + risposta);
    } catch (err) {
      setReportStatus("Errore invio report.");
    }
    setTimeout(()=>setReportStatus(""),2500);
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
                boxShadow: "0 2px 9px #2ec88344"
              }}>{m.testo}</span>
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
          <button className="btn-main" onClick={salvaChat}>Salva Chat</button>
          <button className="btn-export-small" onClick={esportaChat}>Esporta Chat</button>
          <button className="btn-main" onClick={report}>Carica Report</button>
        </div>
        {reportStatus && <div style={{ color: "#2ec883", marginBottom: 8 }}>{reportStatus}</div>}
      </div>
    </div>
  );
}
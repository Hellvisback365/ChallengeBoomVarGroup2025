import React, { useState } from "react";

const WEBHOOK_URL = "https://valeriolorito.app.n8n.cloud/webhook/trascrizione";

export default function RispostaWebhook() {
  const [msg, setMsg] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendToWebhook = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const storico = localStorage.getItem("conversazione") || "";
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frase: msg, storico }),
      });
      const text = await res.text();
      setResponse(text);
    } catch (err) {
      setResponse("Errore durante l'invio al webhook.");
    }
    setLoading(false);
  };

  return (
    <div className="main-cards-mobile">
      <div className="glass-effect card-chat" style={{ maxWidth: 500, margin: "2em auto", padding: "1.5em" }}>
        <div className="card-title">Risposta Webhook</div>
        <textarea
          className="webhook-textarea"
          rows={3}
          style={{ width: "100%", marginBottom: "1em", borderRadius: "12px", border: "none", fontSize: "1em", padding: "10px" }}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Scrivi la frase da inviare..."
        />
        <button
          className="btn-main"
          disabled={loading || !msg}
          onClick={sendToWebhook}
          style={{marginBottom:"1em"}}
        >
          {loading ? "Inviando..." : "Interrompi e Invia"}
        </button>
        <div className="webhook-response" style={{
          marginTop: 10,
          background: "#232532",
          color: "#38e99a",
          padding: 10,
          borderRadius: 10,
          minHeight: "32px",
        }}>
          <strong>Risposta:</strong>
          <div style={{paddingTop:6}}>{response}</div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";

const WEBHOOK_URL = "https://valeriolorito.app.n8n.cloud/webhook/trascrizione";

export default function ReportFinale() {
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
    <div className="w-full font-sans antialiased text-gray-100">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-500 pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2500 pointer-events-none"></div>

      <div className="w-full max-w-xl mx-auto p-6 bg-gray-800 rounded-xl shadow-custom-dark border border-gray-700 animate-slide-in-top">
        <div className="text-3xl font-bold text-gray-600 mb-6 text-center">Genera Report Finale</div>
        <textarea
          className="w-full mb-6 rounded-xl border border-gray-600 text-base p-4 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 shadow-inner"
          rows={4}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Scrivi la frase da inviare per generare il report finale..."
        />
        <button
          className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-interactive animate-glow-pulse"
          disabled={loading || !msg}
          onClick={sendToWebhook}
        >
          {loading ? "Inviando..." : "Genera e Invia Report"}
        </button>
        <div className="mt-4 bg-gray-700 border border-gray-600 text-green-400 p-4 rounded-xl min-h-[40px] shadow-inner animate-fade-in">
          <strong className="text-gray-50 block mb-2">Risposta del Server:</strong>
          <div className="text-gray-200 break-words">{response}</div>
        </div>
      </div>
    </div>
  );
}

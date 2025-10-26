import React, { useState } from "react";

const REPORT_URL = "https://valeriolorito.app.n8n.cloud/webhook/ff2a7c52-356d-4ec5-b9a4-8ae14f88650b";

export default function ReportFinale() {
  const [showModal, setShowModal] = useState(false);
  const [consultantName, setConsultantName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Rende cliccabili eventuali URL nel messaggio di risposta
  function linkifyResponse(text) {
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
            style={{ color: '#23d7fc', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {part}
          </a>
        );
      }
      return <span key={`text-${idx}`}>{part}</span>;
    });
  }

  const handleGenerateReport = async () => {
    if (!consultantName.trim() || !companyName.trim() || !reportDate.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      // Converti la data da yyyy-mm-dd a gg.mm.aaaa
      const [year, month, day] = reportDate.split('-');
      const formattedDate = `${day}.${month}.${year}`;
      
      const res = await fetch(REPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultantName: consultantName.toUpperCase(),
          companyName: companyName.toUpperCase(),
          data: formattedDate,
          userMessage: userMessage,
        }),
      });
      const text = await res.text();
      setResponse(text);
    } catch (err) {
      setResponse("Errore durante la generazione del report.");
    }
    setLoading(false);
    setShowModal(false);
    setConsultantName("");
    setCompanyName("");
    setReportDate("");
    setUserMessage("");
  };

  return (
    <div className="w-full font-sans antialiased text-gray-100">
      
      <div className="w-full max-w-xl mx-auto p-6 bg-gray-800 rounded-xl shadow-custom-dark border border-gray-700 animate-slide-in-top">
        <div className="text-3xl font-bold text-white mb-6 text-center">Genera Report Finale</div>
        
        <button
          className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-300 mb-6 shadow-interactive animate-glow-pulse"
          onClick={() => setShowModal(true)}
        >
          Genera Report
        </button>

        {response && (
          <div className="mt-4 bg-gray-700 border border-gray-600 text-green-400 p-4 rounded-xl min-h-[40px] shadow-inner animate-fade-in">
            <strong className="text-gray-50 block mb-2">Risposta del Server:</strong>
            <div className="text-gray-200 break-words">{linkifyResponse(response)}</div>
          </div>
        )}
      </div>

      {/* Modal per inserimento dati */}
      {showModal && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
          <div className="bg-gray-800 border-l-4 border-gray-600 shadow-lg mx-4 mt-4 rounded-lg">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="ml-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-50">Dati Report Aziendale</h3>
                  <p className="text-sm text-gray-400 mt-1">Inserisci i dati per generare il report finale</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
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
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Nome Azienda Richiedente</label>
                  <input
                    className="w-full border border-gray-600 rounded-xl px-4 py-2 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="VarGroup S.p.A."
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Messaggio</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-600 rounded-xl px-4 py-2 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Inserisci un messaggio opzionale per il report..."
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Data Creazione Report</label>
                  <input
                    type="date"
                    className="w-full border border-gray-600 rounded-xl px-4 py-2 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-4 pt-3">
                  <button
                    className="flex-1 bg-gray-700 text-white px-5 py-2.5 rounded-xl hover:bg-gray-600 disabled:opacity-60 font-semibold shadow-interactive transition-all duration-300"
                    onClick={handleGenerateReport}
                    disabled={loading || !consultantName.trim() || !companyName.trim() || !reportDate.trim()}
                  >
                    {loading ? "Generazione..." : "Genera Report"}
                  </button>
                  <button
                    className="flex-1 bg-gray-600 text-gray-100 px-5 py-2.5 rounded-xl hover:bg-gray-500 font-semibold shadow-sm transition-all duration-300"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
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

import { Routes, Route, useNavigate } from "react-router-dom";
import FaseTrascrizione from "./FaseTrascrizione.jsx";
import "./index.css";
import { useState, useEffect } from "react";
import ReportFinale from "./ReportFinale.jsx";
import AssistenteVarGroup from "./AssistenteVarGroup.jsx";
import ReturnToWorkflowButton from "./ReturnToWorkflowButton.jsx";


function WorkflowSteps() {
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  return (
    <div className="bg-gray-700 min-h-screen flex flex-col items-center pt-16 font-sans antialiased text-gray-100 relative overflow-hidden">
      
      {/* Titolo con effetto */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-50 text-center mb-16 drop-shadow-lg animate-slide-in-top">
        Workflow AI <span className="text-gray-700">Suite</span>
      </h1>
      <div className="flex justify-center gap-8 mt-5 w-full max-w-6xl px-4 flex-nowrap overflow-x-auto">
        <div className="group bg-gray-900 border border-gray-800 rounded-2xl p-8 min-w-[280px] max-w-[360px] shadow-custom-dark transition-all duration-500 cursor-pointer relative overflow-hidden transform hover:-translate-y-2 hover:scale-102 animate-fade-in" onClick={() => navigate("fase1")}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-6xl text-gray-700 mb-6 flex justify-center items-center h-20">🔍</div>
            <h2 className="text-3xl font-bold text-gray-50 mb-3 group-hover:text-gray-600 transition-colors duration-300">Fase 1</h2>
            <p className="text-gray-400 text-lg group-hover:text-gray-200 transition-colors duration-300">Analizza il cliente, settore e problema con AI.</p>
          </div>
        </div>

        <div className="group bg-gray-900 border border-gray-800 rounded-2xl p-8 min-w-[280px] max-w-[360px] shadow-custom-dark transition-all duration-500 cursor-pointer relative overflow-hidden transform hover:-translate-y-2 hover:scale-102 animate-fade-in animation-delay-200" onClick={() => navigate("trascrizione")}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-6xl text-gray-700 mb-6 flex justify-center items-center h-20">🎤</div>
            <h2 className="text-3xl font-bold text-gray-50 mb-3 group-hover:text-gray-600 transition-colors duration-300">Fase 2</h2>
            <p className="text-gray-400 text-lg group-hover:text-gray-200 transition-colors duration-300">Trascrivi live e ricevi assistenza AI.</p>
          </div>
        </div>
        <div className="group bg-gray-900 border border-gray-800 rounded-2xl p-8 min-w-[280px] max-w-[360px] shadow-custom-dark transition-all duration-500 cursor-pointer relative overflow-hidden transform hover:-translate-y-2 hover:scale-102 animate-fade-in animation-delay-400" onClick={() => navigate("report")}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-6xl text-gray-700 mb-6 flex justify-center items-center h-20">🧠</div>
            <h2 className="text-3xl font-bold text-gray-50 mb-3 group-hover:text-gray-600 transition-colors duration-300">Fase 3</h2>
            <p className="text-gray-400 text-lg group-hover:text-gray-200 transition-colors duration-300">Genera report finale e invia in cloud.</p>
          </div>
        </div>
      </div>
      {/* Pulsante aiuto */}
      <button className="fixed bottom-8 left-8 bg-gray-800 text-white text-2xl font-bold rounded-full p-5 shadow-lg hover:bg-gray-700 transition-all duration-300 z-20 animate-glow-pulse" onClick={() => alert("Hai bisogno di assistenza?")}>
        <span role="img" aria-label="Aiuto">❓</span>
      </button>
    </div>
  );
}


function Home() {
  return (
    <div className="bg-gray-700 min-h-screen px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-100 text-center pt-10">Seleziona la Fase del Workflow</h1>
      <WorkflowSteps />
    </div>
  );
}

// Fase 1 contenuto (puoi evolverlo con componenti, form, AI etc)
function Fase1() {
  return (
    <div className="bg-gray-700 min-h-screen pt-10 pb-20 font-sans antialiased text-gray-100">
      <div className="max-w-4xl mx-auto mb-8 p-6 md:p-0">
        <h2 className="text-3xl font-bold text-gray-200 mb-6">Ricerca Informazioni</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          <b className="font-semibold text-gray-50">Step attivo:</b> Raccogli e analizza tutte le informazioni sull'azienda, settore con AI.<br />
          Usa i tool dedicati n8n per la ricerca e compila il report con i dati fondamentali su cliente, competitors, economia.
        </p>
        <ul className="list-disc list-inside text-gray-200 mb-8 space-y-2">
          <li><b className="text-gray-50">Input:</b> Nome azienda, settore, problema</li>
          <li><b className="text-gray-50">Output:</b> Panoramica, lista competitors, analisi economica</li>
        </ul>
      </div>
      <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-xl shadow-custom-dark">
        <AssistenteVarGroup />
      </div>
      <ReturnToWorkflowButton />
    </div>
  );
}

// Fase 3 contenuto (puoi evolverlo con report, download, integrazioni ecc)
function Report() {
  return (
    <div className="bg-gray-700 min-h-screen pt-10 pb-20 font-sans antialiased text-gray-100">
      <div className="max-w-4xl mx-auto mb-8 p-6 md:p-0">
        <h2 className="text-3xl font-bold text-gray-200 mb-6">Genera Report Finale</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          <b className="font-semibold text-gray-50">Step attivo:</b> Elabora e sintetizza i dati raccolti nelle fasi precedenti.
        </p>
        <ul className="list-disc list-inside text-gray-200 mb-8 space-y-2">
          <li><b className="text-gray-50">Output:</b> Report PDF/Word pronto per invio</li>
          <li><b className="text-gray-50">Storage:</b> Salvataggio automatico su Google Drive e invio Email</li>
        </ul>
      </div>
      <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-xl shadow-custom-dark">
        <ReportFinale />
      </div>
      <ReturnToWorkflowButton />
    </div>
  );
}

export default function App() {

// Questo useEffect viene eseguito UNA SOLA volta quando l'app si carica
  useEffect(() => {
    // Pulisce il localStorage all'avvio dell'app
    console.log("App caricata, pulizia sessione precedente.");
    localStorage.removeItem("conversazione");
    localStorage.removeItem("chatVarGroup");
  }, []); // L'array vuoto [] assicura che venga eseguito solo una volta

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/fase1" element={<Fase1 />} />
      <Route path="/trascrizione" element={<FaseTrascrizione />} />
      <Route path="/report" element={<Report />} />
      {/* Per robustezza: qualsiasi altro path, ritorna Home */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

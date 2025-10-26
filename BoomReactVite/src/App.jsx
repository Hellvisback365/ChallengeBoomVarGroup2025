import { Routes, Route, useNavigate } from "react-router-dom";
import FaseTrascrizione from "./FaseTrascrizione.jsx";
import "./index.css";
import { useState, useEffect, useRef } from "react";
import ReportFinale from "./ReportFinale.jsx";
import AssistenteVarGroup from "./AssistenteVarGroup.jsx";
import ReturnToWorkflowButton from "./ReturnToWorkflowButton.jsx";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";



function WorkflowSteps() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false); // State per la visibilità della modale di aiuto
  const [helpStep, setHelpStep] = useState(0); // Nuovo stato per il passo della guida
  const navigate = useNavigate();

  const scrollContainerRef = useRef(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const phaseCount = 3; // Numero totale di fasi

  // Funzione per scorrere programmaticamente
  const scrollToPhase = (index) => {
    if (scrollContainerRef.current) {
      const phaseWidth = scrollContainerRef.current.scrollWidth / phaseCount;
      scrollContainerRef.current.scrollTo({
        left: index * phaseWidth,
        behavior: "smooth",
      });
      setCurrentPhaseIndex(index);
    }
  };

  // Gestori per i pulsanti Avanti/Indietro
  const handlePrevPhase = () => {
    scrollToPhase(Math.max(0, currentPhaseIndex - 1));
  };

  const handleNextPhase = () => {
    scrollToPhase(Math.min(phaseCount - 1, currentPhaseIndex + 1));
  };

  useEffect(() => {
    // Inizialmente, scorrere alla Fase 1 (indice 0)
    scrollToPhase(0);
  }, []);

  const helpContent = [
    {
      title: "Benvenuto nella Workflow AI Suite!",
      description: "Questa guida ti accompagnerà attraverso le funzionalità principali della nostra piattaforma di consulenza ottimizzata con l'Intelligenza Artificiale. Usa i pulsanti 'Avanti' e 'Indietro' per navigare tra le sezioni.",
    },
    {
      title: "Fase 1: Analisi Cliente e Settore con AI",
      description: "<strong>Obiettivo:</strong> Ottenere un'analisi preliminare approfondita del cliente e del suo mercato.<br/><br/><strong>Come Funziona:</strong> Interagisci con l'Assistente VarGroup. Fornisci il nome dell'azienda, il settore e il problema. L'AI raccoglierà informazioni economiche, identificherà i competitor e cercherà consulenti VarGroup esperti o con precedenti esperienze con il cliente.<br/><br/><strong>Risultato:</strong> Un report strutturato che funge da base per la consulenza.",
    },
    {
      title: "Fase 2: Trascrizione Live e Assistenza AI",
      description: "<strong>Obiettivo:</strong> Ricevere suggerimenti in tempo reale durante un meeting con il cliente.<br/><br/><strong>Come Funziona:</strong> Attiva il microfono. L'AI trascriverà la conversazione e ti fornirà istantaneamente domande da porre al cliente, idee per grafici esplicativi e spunti progettuali, basandosi sul contesto del dialogo.<br/><br/><strong>Risultato:</strong> Supporto dinamico per condurre meeting più efficaci.",
    },
    {
      title: "Fase 3: Generazione Report Finale e Invio in Cloud",
      description: "<strong>Obiettivo:</strong> Creare e archiviare il report finale della consulenza.<br/><br/><strong>Come Funziona:</strong> Inserisci i dettagli del consulente, dell'azienda e la data. Il sistema compilerà un report finale unendo i dati della Fase 1 e, se disponibile, la trascrizione della Fase 2. Il report sarà convertito in PDF e salvato automaticamente su Google Drive, con invio via email.<br/><br/><strong>Risultato:</strong> Documentazione completa e organizzata della consulenza, facilmente condivisibile.",
    },
  ];

  const currentHelpStepContent = helpContent[helpStep];
  const totalHelpSteps = helpContent.length;

  const handleOpenHelpModal = () => {
    setShowHelpModal(true);
    setHelpStep(0); // Inizia sempre dal primo step
  };

  const handleNextHelpStep = () => {
    setHelpStep((prevStep) => Math.min(prevStep + 1, totalHelpSteps - 1));
  };

  const handlePreviousHelpStep = () => {
    setHelpStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleCloseHelpModal = () => {
    setShowHelpModal(false);
    setHelpStep(0); // Resetta lo step quando si chiude
  };

  return (
    <div className="bg-gray-700 min-h-screen flex flex-col items-center pt-16 font-sans antialiased text-gray-100 relative overflow-hidden">
      
      {/* Titolo con effetto */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-50 text-center mb-16 drop-shadow-lg animate-slide-in-top">
        Workflow AI <span className="text-blue-400">Suite</span>
      </h1>
      <div className="relative w-full max-w-6xl">
        <div ref={scrollContainerRef} className="flex gap-8 mt-5 px-4 flex-nowrap overflow-x-auto snap-x snap-mandatory max-w-full">
          <div className="group bg-gray-800 border border-gray-800 rounded-2xl p-8 min-w-[280px] max-w-[360px] shadow-custom-dark transition-all duration-500 cursor-pointer relative overflow-hidden transform hover:-translate-y-2 hover:scale-102 animate-fade-in snap-center" onClick={() => navigate("fase1")}>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-6xl text-gray-700 mb-6 flex justify-center items-center h-20">🔍</div>
              <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-gray-600 transition-colors duration-300">Fase 1</h2>
              <p className="text-white text-lg group-hover:text-gray-200 transition-colors duration-300">Analizza il cliente, settore e problema con AI.</p>
            </div>
          </div>
          <div className="group bg-gray-800 border border-gray-800 rounded-2xl p-8 min-w-[280px] max-w-[360px] shadow-custom-dark transition-all duration-500 cursor-pointer relative overflow-hidden transform hover:-translate-y-2 hover:scale-102 animate-fade-in animation-delay-200 snap-center" onClick={() => navigate("trascrizione")}>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-6xl text-gray-700 mb-6 flex justify-center items-center h-20">🎤</div>
              <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-gray-600 transition-colors duration-300">Fase 2</h2>
              <p className="text-white text-lg group-hover:text-gray-200 transition-colors duration-300">Trascrivi live e ricevi assistenza AI.</p>
            </div>
          </div>
          <div className="group bg-gray-800 border border-gray-800 rounded-2xl p-8 min-w-[280px] max-w-[360px] shadow-custom-dark transition-all duration-500 cursor-pointer relative overflow-hidden transform hover:-translate-y-2 hover:scale-102 animate-fade-in animation-delay-400 snap-center" onClick={() => navigate("report")}>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-6xl text-gray-700 mb-6 flex justify-center items-center h-20">🧠</div>
              <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-gray-600 transition-colors duration-300">Fase 3</h2>
              <p className="text-white text-lg group-hover:text-gray-200 transition-colors duration-300">Genera report finale e invia in cloud.</p>
            </div>
          </div>
        </div>
        {/* Pulsanti di navigazione */}
        <button
          onClick={handlePrevPhase}
          disabled={currentPhaseIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-200 z-10 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNextPhase}
          disabled={currentPhaseIndex === phaseCount - 1}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-200 z-10 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {/* Pulsante aiuto */}
      <button className="fixed bottom-8 left-8 bg-gray-800 text-white text-2xl font-bold rounded-full p-5 shadow-lg hover:bg-gray-700 transition-all duration-300 z-20 animate-glow-pulse" onClick={handleOpenHelpModal}>
        <span role="img" aria-label="Aiuto">❓</span>
      </button>

      {/* Modale di aiuto */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 m-4 max-w-lg w-full shadow-custom-dark relative transform scale-95 animate-slide-in-top-modal">
            <h3 className="text-3xl font-bold text-gray-50 mb-6 text-center">{currentHelpStepContent.title}</h3>
            <p className="text-gray-300 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentHelpStepContent.description.replace(/\n/g, '<br/>') }}></p>

            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-50 transition-colors duration-200"
              onClick={handleCloseHelpModal}
              aria-label="Chiudi assistenza"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-between mt-6">
              <button
                className={`bg-gray-700 text-gray-50 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg ${helpStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                onClick={handlePreviousHelpStep}
                disabled={helpStep === 0}
              >
                Indietro
              </button>
              <button
                className="bg-gray-700 text-gray-50 font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg"
                onClick={helpStep === totalHelpSteps - 1 ? handleCloseHelpModal : handleNextHelpStep}
              >
                {helpStep === totalHelpSteps - 1 ? "Ho Capito" : "Avanti"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/fase1" element={<Fase1 />} />
      <Route path="/trascrizione" element={<FaseTrascrizione />} />
      <Route path="/report" element={<Report />} />
      {/* Per robustezza: qualsiasi altro path, ritorna Home */}
      <Route path="*" element={<Home />} />
    </Routes>
    <Analytics />
    <SpeedInsights />
    </>
  );
}

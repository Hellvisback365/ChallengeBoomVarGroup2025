import { Routes, Route, useNavigate } from "react-router-dom";
import FaseTrascrizione from "./FaseTrascrizione.jsx";
import "./index.css";
import { useState } from "react";
import RispostaWebhook from "./RispostaWebhook.jsx";
import AssistenteVarGroup from "./AssistenteVarGroup.jsx";


function WorkflowSteps() {
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  return (
    <div className="home-futuristic-bg">
      <div className="glow-ring"></div>
      {/* Titolo con effetto */}
      <h1 className="futuristic-title">Workflow AI <span>Suite</span></h1>
      <div className="step-cards-flex">
      <div className="futuristic-card phase1 active" onClick={() => navigate("fase1")}>
        <div className="icon-phase">🔍</div>
        <h2>Fase 1</h2>
        <p>Analizza il cliente, settore e problema con AI.</p>
      </div>

        <div className="futuristic-card phase2 active" onClick={() => navigate("trascrizione")}>
          <div className="icon-phase">🎤</div>
          <h2>Fase 2</h2>
          <p>Trascrivi live e ricevi assistenza AI.</p>
        </div>
        <div className="futuristic-card phase3 active" onClick={() => navigate("report")}>
          <div className="icon-phase">🧠</div>
          <h2>Fase 3</h2>
          <p>Genera report finale e invia in cloud.</p>
        </div>
      </div>
      {/* Pulsante aiuto ? */}
      <button className="btn-float-help" onClick={() => alert("Hai bisogno di assistenza?")}>
        <span role="img" aria-label="Aiuto">❓</span>
      </button>
    </div>
  );
}


function Home() {
  return (
    <div>
      <h1>Seleziona la Fase del Workflow</h1>
      <WorkflowSteps />
    </div>
  );
}

// Fase 1 contenuto (puoi evolverlo con componenti, form, AI etc)
function Fase1() {
  return (
    <div style={{ maxWidth: "680px", margin: "3em auto 0 auto", padding: "1.1em 0" }}>
      <h2 style={{ color: "#23d7fc" }}>Ricerca Informazioni</h2>
      <p>
        <b>Step attivo:</b> Raccogli e analizza tutte le informazioni sull'azienda, settore con AI.<br />
        Usa i tool dedicati n8n per la ricerca e compila il report con i dati fondamentali su cliente, competitors, economia.
      </p>
      <ul>
        <li><b>Input:</b> Nome azienda, settore, problema</li>
        <li><b>Output:</b> Panoramica, lista competitors, analisi economica</li>
      </ul>
      {/* Qui puoi aggiungere form, componenti smart, ricerca API ecc */}
    </div>
  );
}

// Fase 3 contenuto (puoi evolverlo con report, download, integrazioni ecc)
function Report() {
  return (
    <div style={{ maxWidth: "680px", margin: "3em auto 0 auto", padding: "1.1em 0" }}>
      <h2 style={{ color: "#ff8a00" }}>Genera Report Finale</h2>
      <p>
        <b>Step attivo:</b> Elabora e sintetizza i dati raccolti nelle fasi precedenti.
      </p>
      <ul>
        <li><b>Output:</b> Report PDF/Word pronto per invio</li>
        <li><b>Storage:</b> Salvataggio automatico su Google Drive e invio Email</li>
      </ul>
      {/* Qui puoi aggiungere generazione file, form invio email, ecc */}
    </div>
  );
}

export default function App() {
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

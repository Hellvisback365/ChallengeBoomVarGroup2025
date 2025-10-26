# ZENITH - VarGroup AI Workflow Suite

Una suite di strumenti AI per la gestione delle consulenze aziendali, sviluppata con React, Vite e Tailwind CSS.

## 📋 Descrizione

ZENITH è un'applicazione web che integra tre assistenti AI specializzati per supportare il processo di consulenza aziendale:

- **Zenith-Research** (Fase 1): Ricerca e analisi aziendale
- **Zenith-Transcript** (Fase 2): Trascrizione in tempo reale con suggerimenti IRT
- **Zenith-Report** (Fase 3): Generazione automatica di report finali

## 🚀 Installazione e Avvio

### Prerequisiti

Assicurati di avere installato sul tuo sistema:
- **Node.js** (versione 18 o superiore)
- **npm** (versione 9 o superiore)

### Passaggi per l'installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/Hellvisback365/ChallengeBoom.git
   cd ChallengeBoom/BoomReactVite
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

4. **Apri l'applicazione**
   
   L'applicazione sarà disponibile all'indirizzo indicato nel terminale (solitamente `http://localhost:5173`)

## 📦 Comandi Disponibili

- **`npm run dev`** - Avvia il server di sviluppo con hot-reload
- **`npm run build`** - Crea la build di produzione nella cartella `dist`
- **`npm run preview`** - Visualizza l'anteprima della build di produzione
- **`npm run lint`** - Esegue il linting del codice con ESLint

## 🛠️ Stack Tecnologico

- **React 19** - Framework UI
- **Vite** (Rolldown) - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router DOM** - Gestione del routing
- **React Icons** - Libreria di icone
- **Lottie** - Animazioni
- **Vercel Analytics & Speed Insights** - Monitoraggio performance

## 🎨 Funzionalità Principali

### Fase 1 - Ricerca e Analisi
Interfaccia di chat per interagire con Zenith-Research e ottenere analisi aziendali dettagliate.

### Fase 2 - Trascrizione
Trascrizione vocale in tempo reale con il supporto dell'API Web Speech e suggerimenti AI contestuali.

### Fase 3 - Report Finale
Generazione automatica di report conclusivi personalizzati per consulente e azienda.

## 🔧 Configurazione

L'applicazione utilizza webhook n8n per l'integrazione backend. Gli endpoint sono configurati direttamente nei componenti.

## 📱 Compatibilità

- ✅ Chrome/Edge (consigliato per la trascrizione vocale)
- ✅ Firefox
- ✅ Safari
- ✅ Design responsive per mobile e desktop

## 🐛 Risoluzione Problemi

### Errore: "Failed to resolve import"
Se incontri errori di import dopo aver installato nuove dipendenze:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta già in uso
Se la porta 5173 è occupata, Vite utilizzerà automaticamente la porta successiva disponibile (es. 5174).

## 📄 Licenza

Progetto privato - Tutti i diritti riservati

## 👥 Autore

VarGroup Team

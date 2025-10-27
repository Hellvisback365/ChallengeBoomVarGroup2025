# ZENITH - VarGroup AI Workflow Suite

Una suite di strumenti AI per la gestione delle consulenze aziendali, sviluppata con React, Vite e Tailwind CSS.

## 📋 Panoramica

ZENITH guida il consulente attraverso un percorso in tre fasi, con un'interfaccia dark mode e un assistente contestuale integrato:

- **Fase 1 · Zenith-Research** – chat AI per raccogliere contesto su cliente, settore e bisogni, con opzione di invio report al workflow N8N.
- **Fase 2 · Zenith-Transcript** – trascrizione vocale in tempo reale dal browser (Web Speech API) e suggerimenti dinamici generati via webhook.
- **Fase 3 · Zenith-Report** – generazione del report conclusivo con recap della consulenza e consegna su Google Drive.
- **Guida interattiva** – pulsante “❓” che apre un walkthrough modale sulle tre fasi e sull’utilizzo della piattaforma.

## 🚀 Installazione e Avvio

### Prerequisiti

Assicurati di avere installato sul tuo sistema:
- **Node.js** (versione 18 o superiore)
- **npm** (versione 9 o superiore)

### Passaggi per l'installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/Hellvisback365/ChallengeBoomVarGroup2025.git
   cd ChallengeBoomVarGroup2025/BoomReactVite
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Imposta gli endpoint N8N**
   - I componenti `src/AssistenteVarGroup.jsx`, `src/FaseTrascrizione.jsx` e `src/ReportFinale.jsx` contengono URL placeholder (`https://example-n8n-instance.com/...`).
   - Sostituiscili con i tuoi endpoint reali oppure leggi la sezione *Configurazione webhook* per centralizzare i valori tramite file `.env`.

4. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

5. **Apri l'applicazione**
   
   L'applicazione sarà disponibile all'indirizzo indicato nel terminale (solitamente `http://localhost:5173`).

**Suggerimento:** ogni volta che aggiorni gli endpoint o le variabili d'ambiente riavvia `npm run dev` per propagare le modifiche.

## ⚙️ Configurazione webhook

Il progetto dialoga con quattro webhook N8N diversi. Per evitare di modificare manualmente i componenti ad ogni variazione, puoi utilizzare le variabili d'ambiente definite in `.env.example`:

1. Copia il template nella modalità desiderata:
   ```bash
   cp .env.example .env.development
   cp .env.example .env.production
   ```
2. Imposta gli URL reali dei tuoi workflow:
   - `VITE_VARGROUP_URL` – chat di Fase 1 (`sendMessage` con sessione persistente)
   - `VITE_REPORT_URL` – upload markdown (usato da Fase 1 e Fase 2)
   - `VITE_N8N_URL` – endpoint di trascrizione e suggerimenti live
   - `VITE_FINAL_REPORT_URL` – generazione report finale
3. Aggiorna i componenti per leggere i valori tramite `import.meta.env.VITE_*` e rimuovere gli URL hardcoded.

> ℹ️ Per ragioni di sicurezza, i file `.env.*` sono ignorati da git. Non committare mai credenziali reali.

## 🧭 Flusso dell'applicazione

- **Home** – tre card selezionano la fase, con scroll orizzontale e pulsanti su mobile. All'avvio vengono pulite le chiavi `conversazione` e `chatVarGroup` dal `localStorage` per evitare residui di sessioni precedenti.
- **Guida** – icona fissa in basso a sinistra che apre una modale multi-step con spiegazioni di prodotto.
- **Fase 1 · Zenith-Research**
  - Chat UI con messaggi memorizzati in `localStorage` (`chatVarGroup`) e sessione identificata da un `sessionId` generato lato client.
  - Richiesta POST al webhook N8N con `{ action: "sendMessage", chatInput, sessionId }` e parsing JSON della risposta (`output`).
  - Pulsante **Carica Report** disponibile dopo la prima risposta AI: invia trascrizione, markdown e metadati (consulente/azienda/data) come `multipart/form-data` allo stesso endpoint usato dalla trascrizione.
- **Fase 2 · Zenith-Transcript**
  - Usa Web Speech API (preferibile Chrome/Edge) per ascoltare audio continuo; la trascrizione viene salvata in `localStorage` (`conversazione`).
  - Ogni nuovo frammento è inviato a N8N con i campi `frase` e `storico`; la risposta può essere un array JSON o testo semplice e popola la colonna *Suggerimenti*.
  - Pulsante **Carica Trascrizione** invia la conversazione completa allo stesso webhook di upload markdown (`isNew = 0`).
- **Fase 3 · Zenith-Report**
  - Modale per inserire dati consulente, azienda, messaggio e data (convertita in `gg.mm.aaaa`).
  - Richiesta POST JSON verso il webhook finale; la risposta testuale viene mostrata con eventuali link Google Drive cliccabili.
- **Navigazione rapida** – `ReturnToWorkflowButton` consente di tornare alla home da qualsiasi fase.
- **Telemetria** – `@vercel/analytics` e `@vercel/speed-insights` sono montati in `App.jsx` per monitoraggio performance.

## 🧱 Componenti e storage

- `App.jsx` – gestisce routing React Router 7, reset del `localStorage`, guide modal e cards delle fasi.
- `AssistenteVarGroup.jsx` – UI della chat, gestione sessioni, normalizzazione markdown, upload report.
- `FaseTrascrizione.jsx` – gestione microfono, trascrizione live, suggerimenti AI, upload trascrizione.
- `ReportFinale.jsx` – generazione report conclusivo con conversione della data e visualizzazione risposta server.
- `ReturnToWorkflowButton.jsx` – floating button riutilizzabile.

## 🛠️ Stack Tecnologico

- **React 19** con componenti funzionali e hook.
- **React Router DOM 7** per il routing multi-fase.
- **Vite 5** come dev server e bundler.
- **Tailwind CSS 3** per lo styling (classi utility e animazioni).
- **React Icons** per la simbologia delle fasi.
- **Web Speech API** nativa del browser per la trascrizione live.
- **Vercel Analytics & Speed Insights** per observability.

Le dipendenze per animazioni Lottie (`@lordicon/react`, `lottie-react`, `lottie-web`) sono disponibili ma non ancora utilizzate nei componenti correnti.

## 📦 Comandi Disponibili

- `npm run dev` – avvia il server di sviluppo con hot-reload.
- `npm run build` – produce la build di produzione in `dist`.
- `npm run preview` – serve la build di produzione localmente.
- `npm run lint` – esegue ESLint con configurazione base React.

## 📚 Note operative

- **Browser consigliato**: Chrome o Edge per sfruttare la Web Speech API senza limitazioni. Firefox/Safari funzionano ma potrebbero richiedere permessi aggiuntivi o disattivare la trascrizione.
- **Permessi microfono**: concedili al primo accesso; l'app tenta di riavviare automaticamente il riconoscimento quando resta attivo.
- **Google Drive**: gli endpoint N8N devono restituire messaggi contenenti i link; l'interfaccia li rende cliccabili.
- **Pulizia locale**: l'avvio dell'app cancella automaticamente conversazioni precedenti per evitare conflitti di report.

## � Risoluzione Problemi

- **SpeechRecognition non supportata** – mostra il messaggio "API Web Speech non supportata"; prova con Chrome/Edge o verifica che `window.SpeechRecognition` sia disponibile.
- **Endpoint N8N non configurato** – i placeholder restituiscono 404/errore; personalizzali prima dei test o sfrutta le variabili d'ambiente.
- **Errore "Failed to resolve import"** dopo aver aggiornato dipendenze:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- **Porta 5173 occupata** – Vite sceglie automaticamente la successiva disponibile (5174, 5175...).

## 📄 Licenza

Progetto privato - Tutti i diritti riservati.

## 👥 Autore

VarGroup Team

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

3. **Configura le variabili d'ambiente**
   
   Il file `.env.development` contiene URL placeholder. Sostituisci con i tuoi endpoint N8N reali:
   
   ```bash
   # Modifica .env.development con i tuoi URL
   VITE_VARGROUP_URL=https://your-instance.app.n8n.cloud/webhook/YOUR_CHAT_WEBHOOK_ID/chat
   VITE_REPORT_URL=https://your-instance.app.n8n.cloud/webhook/YOUR_REPORT_WEBHOOK_ID
   # ... etc
   ```

4. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

5. **Apri l'applicazione**
   
   L'applicazione sarà disponibile all'indirizzo indicato nel terminale (solitamente `http://localhost:5173`)

**Nota:** Se modifichi le variabili d'ambiente in `.env.development`, riavvia il server di sviluppo per applicare le modifiche.

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

### ⚠️ Variabili d'Ambiente

Per la produzione, è fortemente consigliato utilizzare variabili d'ambiente invece di URL hardcoded:

1. **Copia il template delle variabili d'ambiente:**
   ```bash
   cp .env.example .env.production
   ```

2. **Configura le variabili necessarie:**
   - `VITE_VARGROUP_URL` - Endpoint per Zenith-Research chat
   - `VITE_REPORT_URL` - Endpoint per upload report
   - `VITE_N8N_URL` - Endpoint per trascrizione
   - `VITE_FINAL_REPORT_URL` - Endpoint per report finale

3. **Accedi alle variabili nel codice:**
   ```javascript
   const VARGROUP_URL = import.meta.env.VITE_VARGROUP_URL;
   ```

**Nota:** I file `.env.production` e `.env.development` sono già inclusi nel `.gitignore` e non verranno committati.

## 🔒 Sicurezza

⚠️ **IMPORTANTE: Questa repository è solo per scopi dimostrativi.**

Il codice contiene vulnerabilità di sicurezza note che devono essere risolte prima di qualsiasi deployment in produzione. Per informazioni dettagliate, consultare:

- **[SECURITY.md](./SECURITY.md)** - Documentazione completa delle vulnerabilità identificate
- **[.env.example](./.env.example)** - Template per configurazione variabili d'ambiente

### Vulnerabilità Principali Identificate:

| Categoria | Severity | Descrizione |
|-----------|----------|-------------|
| 🔴 Credenziali Esposte | CRITICAL | Webhook URL con token hardcoded nel codice client |
| 🔴 Dati Sensibili | CRITICAL | Informazioni aziendali trasmesse senza protezione aggiuntiva |
| 🟠 XSS | HIGH | Uso di `dangerouslySetInnerHTML` senza sanitizzazione |
| 🟠 CSP | HIGH | Mancanza di Content Security Policy headers |
| 🟠 CDN | HIGH | Dipendenza da CDN esterno senza verifica di integrità |
| 🟠 Storage | HIGH | localStorage non criptato per dati sensibili |

**Per dettagli completi e raccomandazioni, vedi [SECURITY.md](./SECURITY.md)**

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

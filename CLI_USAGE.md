# RepublicMCP - CLI Interactive Usage

Guida all'utilizzo del client CLI interattivo con integrazione Ollama.

## Setup Iniziale

### 1. Installa e avvia Ollama

```bash
# Su macOS
brew install ollama
brew services start ollama

# Oppure manualmente
ollama serve
```

### 2. Scarica il modello Gemma2

```bash
ollama pull qwen2.5:14b
```

Questo modello (2B parametri) è perfetto per analizzare le domande in linguaggio naturale e convertirle in chiamate MCP.

### 3. Build il progetto

```bash
npm install
npm run build
```

## Avvio del CLI

```bash
npm run cli
```

Vedrai:

```
==================================================================
  RepublicMCP con Ollama - Client Interattivo
  Chiedi in linguaggio naturale sui dati del Parlamento
==================================================================

🔌 Connessione al server MCP...
✓ Connesso al server MCP
✓ Caricati 11 tools MCP

🤖 Connessione a Ollama (qwen2.5:14b)...
✓ Ollama connesso

📚 Come usare:
  • Scrivi una domanda in linguaggio naturale
    Es: "Chi è Giorgia Meloni?"
    Es: "Mostrami le ultime votazioni"
    Es: "Quali sono i gruppi parlamentari?"

💡 Comandi speciali:
  /tools    - Lista dei tools MCP disponibili
  /help     - Mostra questo aiuto
  /clear    - Pulisci la conversazione
  /quit     - Esci

🏛️  >
```

## Esempi di Utilizzo

### Domande in Linguaggio Naturale

Il CLI usa Ollama per interpretare le tue domande e chiamare automaticamente i tools MCP giusti.

#### Esempio 1: Cercare un deputato

```
🏛️  > Chi è Giorgia Meloni?

🤔 Analizzando la domanda...
🤖 AI: {"tool": "search_deputati", "params": {"cognome": "Meloni"}}
💭 Cerco il deputato con cognome Meloni

⚙️  Chiamando search_deputati...

✓ Risposta ricevuta:
──────────────────────────────────────────────────────────────────────

📊 Trovati 1 risultati:

1.
   deputato: http://dati.camera.it/ocd/deputato.rdf/d123_19
   cognome: Meloni
   nome: Giorgia
   genere: F
   nomeGruppo: Fratelli d'Italia
   sigla: FDI

──────────────────────────────────────────────────────────────────────
```

#### Esempio 2: Votazioni recenti

```
🏛️  > Mostrami le ultime 5 votazioni

🤔 Analizzando la domanda...
💭 Recupero le votazioni più recenti limitando a 5 risultati

⚙️  Chiamando get_votazioni...

✓ Risposta ricevuta:
──────────────────────────────────────────────────────────────────────

📊 Trovati 5 risultati:

1.
   votazione: http://dati.camera.it/ocd/votazione.rdf/...
   data: 20241105
   favorevoli: 187
   contrari: 95
   astenuti: 12

...
```

#### Esempio 3: Gruppi parlamentari

```
🏛️  > Quali sono i gruppi parlamentari?

🤔 Analizzando la domanda...
💭 Recupero la lista dei gruppi parlamentari della legislatura corrente

⚙️  Chiamando get_gruppi_parlamentari...

✓ Risposta ricevuta:
──────────────────────────────────────────────────────────────────────

📊 Trovati 8 risultati:

1.
   gruppo: http://dati.camera.it/ocd/gruppoParlamentare.rdf/...
   nomeUfficiale: Fratelli d'Italia
   sigla: FDI

2.
   gruppo: http://dati.camera.it/ocd/gruppoParlamentare.rdf/...
   nomeUfficiale: Partito Democratico - Italia Democratica e Progressista
   sigla: PD-IDP

...
```

#### Esempio 4: Atti parlamentari

```
🏛️  > Cerca leggi sulla sanità

🤔 Analizzando la domanda...
💭 Cerco atti parlamentari con 'sanità' nel titolo

⚙️  Chiamando search_atti...

✓ Risposta ricevuta:
──────────────────────────────────────────────────────────────────────

📊 Trovati 15 risultati:

1.
   atto: http://dati.camera.it/ocd/attocamera.rdf/ac19_1234
   numero: 1234
   titolo: Disposizioni in materia di assistenza sanitaria...
   presentazione: 20230315

...
```

#### Esempio 5: Membri del governo

```
🏛️  > Chi sono i membri del governo attuale?

🤔 Analizzando la domanda...
💭 Prima ottengo la lista dei governi, poi i membri dell'ultimo

⚙️  Chiamando get_governi...
⚙️  Chiamando get_governo_membri...

✓ Risposta ricevuta:
──────────────────────────────────────────────────────────────────────

📊 Trovati 25 risultati:

1.
   persona: http://dati.camera.it/ocd/persona.rdf/p123
   nome: Giorgia
   cognome: Meloni
   carica: Presidente del Consiglio dei Ministri

2.
   persona: http://dati.camera.it/ocd/persona.rdf/p456
   nome: Antonio
   cognome: Tajani
   carica: Ministro degli Affari Esteri

...
```

## Comandi Speciali

### /tools - Lista tools disponibili

```
🏛️  > /tools

🔧 Tools MCP disponibili:

1. search_deputati
   Cerca deputati della Camera per nome, cognome o legislatura
   Parametri:
   • nome: Nome del deputato (opzionale)
   • cognome: Cognome del deputato (opzionale)
   • legislatura: Legislatura (es: "repubblica_19", default: corrente)

2. get_deputato_info
   Ottiene informazioni dettagliate su un deputato specifico
   Parametri:
   • uri [obbligatorio]: URI completo del deputato

...
```

### /help - Mostra aiuto

```
🏛️  > /help

📚 Come usare:
  • Scrivi una domanda in linguaggio naturale
    Es: "Chi è Giorgia Meloni?"
    Es: "Mostrami le ultime votazioni"
    Es: "Quali sono i gruppi parlamentari?"

💡 Comandi speciali:
  /tools    - Lista dei tools MCP disponibili
  /help     - Mostra questo aiuto
  /clear    - Pulisci la conversazione
  /quit     - Esci
```

### /clear - Pulisci conversazione

```
🏛️  > /clear

✓ Conversazione pulita
```

### /quit - Esci

```
🏛️  > /quit

👋 Arrivederci!
```

## Tips & Tricks

### 1. Domande Specifiche

Più sei specifico, migliori saranno i risultati:

✅ Buone:
- "Cerca deputati con cognome Rossi"
- "Votazioni del 15 ottobre 2023"
- "Atti sulla sanità nella XIX legislatura"

❌ Vaghe:
- "Deputati"
- "Votazioni"
- "Leggi"

### 2. Usa i Parametri

Puoi specificare parametri nelle domande:

- "Cerca deputati con cognome Meloni nella legislatura 19"
- "Ultime 10 votazioni"
- "Atti di tipo 'disegno di legge' sulla sanità"

### 3. Combina Informazioni

Fai domande che richiedono più tools:

- "Chi è il presidente del consiglio e quali atti ha presentato?"
- "Mostra i membri della commissione bilancio e le loro votazioni"

### 4. Gestione Errori

Se Ollama non capisce:

```
🏛️  > testo incomprensibile xyz

🤔 Analizzando la domanda...
❌ Non riesco a interpretare la domanda
💡 Prova a riformulare in modo più chiaro o usa /help
```

Soluzione: Riformula in modo più semplice o usa `/tools` per vedere cosa puoi chiedere.

## Troubleshooting

### Ollama non connesso

```
❌ Errore: connect ECONNREFUSED 127.0.0.1:11434

💡 Assicurati che Ollama sia in esecuzione:
   brew services start ollama
   oppure: ollama serve
```

**Soluzione:**
```bash
ollama serve
```

### Modello non trovato

```
❌ Modello qwen2.5:14b non trovato.
💡 Esegui: ollama pull qwen2.5:14b
```

**Soluzione:**
```bash
ollama pull qwen2.5:14b
```

### Server MCP non risponde

```
❌ Errore: Server MCP non risponde
```

**Soluzione:**
```bash
# Verifica che il build sia aggiornato
npm run build

# Riprova
npm run cli
```

### Query SPARQL fallisce

```
❌ Errore: SPARQL query failed
```

**Possibili cause:**
- Endpoint SPARQL non raggiungibile (controlla internet)
- Query malformata (bug, segnala!)
- Timeout (riprova)

## Alternative

### CLI Basico (senza Ollama)

Se non vuoi usare Ollama, c'è un CLI basico:

```bash
npm run cli:basic
```

Usa comandi diretti:
```
🏛️  > /call search_deputati {"cognome": "Meloni"}
```

### Web Interface

Per un'interfaccia grafica:

```bash
npm run web
```

Poi apri http://localhost:3000

## Performance

- **Ollama qwen2.5:14b**: ~2-3 secondi per analizzare domanda
- **Query SPARQL**: ~1-5 secondi (dipende dalla complessità)
- **Totale**: 3-8 secondi per domanda

## Limitazioni

- Ollama richiede ~2GB RAM per qwen2.5:14b
- Le domande troppo complesse potrebbero confondere il modello
- Solo italiano/inglese supportati bene
- Dipende dalla connessione internet per SPARQL

## Estensioni Future

- [ ] Streaming responses da Ollama
- [ ] Cache delle risposte frequenti
- [ ] Suggerimenti autocomplete
- [ ] Cronologia delle domande
- [ ] Export risultati in CSV/JSON
- [ ] Multi-turn conversations

---

**Enjoy exploring Italian Parliament data! 🏛️🇮🇹**

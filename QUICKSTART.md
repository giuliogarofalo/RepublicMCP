# RepublicMCP - Quick Start

Inizia a interrogare i dati del Parlamento italiano in 5 minuti!

## Setup Rapido

### 1. Installa Ollama (per il CLI interattivo)

```bash
# macOS
brew install ollama

# Avvia Ollama
brew services start ollama

# Scarica il modello
ollama pull qwen2.5:14b
```

### 2. Installa RepublicMCP

```bash
cd /Users/giuliogarofalo/mine/republicMCP
npm install
npm run build
```

## Modalità CLI Interattiva (Consigliata)

La modalità più semplice per iniziare:

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

🏛️  >
```

### Prova queste domande:

```
🏛️  > Chi è Giorgia Meloni?
🏛️  > Mostrami le ultime 5 votazioni
🏛️  > Quali sono i gruppi parlamentari?
🏛️  > Cerca deputati con cognome Rossi
🏛️  > Chi sono i membri del governo?
```

### Comandi Utili:

```
/tools    - Vedi tutti i tools disponibili
/help     - Mostra l'aiuto
/quit     - Esci
```

## Modalità Web Interface

Se preferisci un'interfaccia grafica:

```bash
npm run web
```

Poi apri: **http://localhost:3000**

Vedrai un'interfaccia web dove puoi:
1. Selezionare un tool dalla sidebar
2. Compilare i parametri
3. Vedere i risultati formattati

## Modalità Claude Desktop

Per usare RepublicMCP con Claude Desktop:

### 1. Configura

Apri `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "republic": {
      "command": "node",
      "args": ["/Users/giuliogarofalo/mine/republicMCP/dist/index.js"]
    }
  }
}
```

### 2. Riavvia Claude Desktop

### 3. Usa

Chiedi a Claude:
- "Chi è il presidente del consiglio?"
- "Mostrami le ultime votazioni"
- "Quali sono i gruppi parlamentari?"

Claude userà automaticamente RepublicMCP per rispondere!

## Esempi Pratici

### Esempio 1: Cercare un Deputato

**CLI:**
```
🏛️  > Chi è Giorgia Meloni?
```

**Risultato:**
```
📊 Trovati 1 risultati:

1.
   deputato: http://dati.camera.it/ocd/deputato.rdf/d123_19
   cognome: Meloni
   nome: Giorgia
   genere: F
   dataNascita: 19770115
   luogoNascita: Roma
   nomeGruppo: Fratelli d'Italia
   sigla: FDI
   collegio: Lazio 1 - 01
```

### Esempio 2: Votazioni Recenti

**CLI:**
```
🏛️  > Ultime 5 votazioni
```

**Risultato:**
```
📊 Trovati 5 risultati:

1.
   data: 20241105
   favorevoli: 187
   contrari: 95
   astenuti: 12
   titolo: Votazione finale DDL bilancio 2024

2.
   data: 20241104
   favorevoli: 201
   contrari: 89
   astenuti: 5
   ...
```

### Esempio 3: Atti Parlamentari

**CLI:**
```
🏛️  > Cerca leggi sulla sanità
```

**Risultato:**
```
📊 Trovati 15 risultati:

1.
   numero: 1234
   titolo: Disposizioni in materia di assistenza sanitaria territoriale
   presentazione: 20230315
   iniziativa: Governo

2.
   numero: 1567
   titolo: Modifiche al sistema sanitario nazionale
   presentazione: 20230228
   ...
```

## Troubleshooting Rapido

### Ollama non connesso

```bash
# Verifica che Ollama sia running
ollama list

# Se non funziona, avvialo manualmente
ollama serve
```

### Modello mancante

```bash
ollama pull qwen2.5:14b
```

### Build fallisce

```bash
# Pulisci e riprova
rm -rf node_modules dist
npm install
npm run build
```

### Query SPARQL lente

Normale! L'endpoint può essere lento. Usa `limit` basso per query esplorative.

## Prossimi Passi

Ora che hai configurato RepublicMCP:

1. **Esplora i dati**: Usa `/tools` nel CLI per vedere cosa puoi fare
2. **Leggi la documentazione**: Vedi `docs/` per info sull'ontologia
3. **Guarda gli esempi**: `USAGE_EXAMPLES.md` ha tonnellate di esempi
4. **Query SPARQL**: Impara SPARQL per query personalizzate

## Risorse

- **CLI Completo**: `CLI_USAGE.md`
- **Esempi Uso**: `USAGE_EXAMPLES.md`
- **Installazione**: `INSTALLATION.md`
- **Docs Ontologia**: `docs/`

## Help

Problemi? Controlla:
1. Ollama è in esecuzione? (`ollama list`)
2. Build completato? (`ls dist/index.js`)
3. Connessione internet? (SPARQL endpoint è remoto)

---

**Buon divertimento con i dati del Parlamento! 🏛️🇮🇹**

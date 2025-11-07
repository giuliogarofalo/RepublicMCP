# Installazione e Configurazione - RepublicMCP

Guida all'installazione e configurazione del server MCP per i dati aperti del Parlamento italiano.

## Prerequisiti

- Node.js >= 18.0.0
- npm o yarn
- Claude Desktop (per l'integrazione con Claude)

## Installazione

### 1. Clone e setup del progetto

```bash
cd /Users/giuliogarofalo/mine/republicMCP
npm install
```

### 2. Build del progetto

```bash
npm run build
```

Questo compilerà il codice TypeScript nella cartella `dist/`.

### 3. Test delle query

Prima di configurare il server MCP, è consigliato testare che le query SPARQL funzionino correttamente:

```bash
npm run dev
```

Oppure testa direttamente lo script di test:

```bash
npx tsx examples/test-queries.ts
```

## Configurazione con Claude Desktop

### Opzione 1: Configurazione manuale

1. Apri il file di configurazione di Claude Desktop:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Aggiungi la configurazione del server RepublicMCP:

```json
{
  "mcpServers": {
    "republic": {
      "command": "node",
      "args": ["/Users/giuliogarofalo/mine/republicMCP/dist/index.js"],
      "env": {}
    }
  }
}
```

**Importante**: Assicurati di usare il percorso assoluto corretto al file `dist/index.js`.

3. Riavvia Claude Desktop

### Opzione 2: Test con stdio (per sviluppo)

Puoi testare il server MCP direttamente da terminale:

```bash
node dist/index.js
```

Il server ascolterà su stdin/stdout. Puoi inviare richieste JSON in formato MCP per testare i tool.

## Verifica dell'installazione

Una volta configurato e riavviato Claude Desktop:

1. Apri una nuova conversazione con Claude
2. Verifica che il server MCP sia attivo guardando l'icona o il menu degli strumenti
3. Prova un comando come:
   ```
   Chi è il presidente del consiglio in carica?
   ```

Claude dovrebbe utilizzare automaticamente il tool `search_deputati` per rispondere.

## Troubleshooting

### Il server non si avvia

1. Verifica che il build sia stato completato:
   ```bash
   ls dist/index.js
   ```

2. Verifica che le dipendenze siano installate:
   ```bash
   npm install
   ```

3. Controlla i log di Claude Desktop:
   - **macOS**: `~/Library/Logs/Claude/`
   - **Windows**: `%APPDATA%\Claude\logs\`

### Le query SPARQL falliscono

1. Verifica la connessione a internet (il server deve raggiungere `https://dati.camera.it/sparql`)

2. Testa manualmente una query sull'endpoint:
   ```bash
   curl -X POST https://dati.camera.it/sparql \
     -H "Content-Type: application/sparql-query" \
     -H "Accept: application/sparql-results+json" \
     -d "SELECT DISTINCT ?o WHERE {[] a ?o} LIMIT 10"
   ```

3. Controlla i log del server per errori specifici

### Claude non usa i tool MCP

1. Assicurati che Claude Desktop sia stato riavviato dopo la configurazione
2. Verifica che il percorso nel file di config sia corretto (usa percorsi assoluti)
3. Prova a chiedere esplicitamente a Claude di usare un tool specifico:
   ```
   Usa il tool search_deputati per cercare deputati con cognome Rossi
   ```

## Sviluppo

### Watch mode

Per sviluppare con auto-reload:

```bash
npm run watch
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Aggiornamenti

Per aggiornare il server:

```bash
cd /Users/giuliogarofalo/mine/republicMCP
git pull  # se usi git
npm install
npm run build
```

Poi riavvia Claude Desktop.

## Disinstallazione

1. Rimuovi la configurazione dal file `claude_desktop_config.json`
2. Riavvia Claude Desktop
3. (Opzionale) Elimina la cartella del progetto:
   ```bash
   rm -rf /Users/giuliogarofalo/mine/republicMCP
   ```

## Supporto

Per problemi o domande:
- Consulta la documentazione in `docs/`
- Controlla gli esempi in `examples/`
- Apri una issue su GitHub (se disponibile)

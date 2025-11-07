# RepublicMCP - MCP Server per Dati Aperti Camera e Senato

Un server MCP (Model Context Protocol) per interrogare i dati aperti pubblicati dalla Camera dei Deputati e dal Senato della Repubblica Italiana.

## Descrizione

Questo server MCP fornisce strumenti per interrogare in modo strutturato gli endpoint SPARQL dei dati aperti del Parlamento italiano, permettendo a chatbot e assistenti AI di accedere a informazioni attendibili e ufficiali su:

- Deputati e Senatori
- Atti parlamentari (disegni di legge, proposte, emendamenti)
- Votazioni
- Commissioni e organi parlamentari
- Governi e membri del governo
- Sedute e discussioni

## Caratteristiche

- Accesso diretto agli endpoint SPARQL ufficiali
- Query pre-strutturate per casi d'uso comuni
- Mapping completo dell'ontologia OCD (Ontologia Camera dei Deputati)
- Supporto per query SPARQL personalizzate
- Validazione e parsing delle risposte
- Cache intelligente per ottimizzare le prestazioni

## Endpoint Supportati

### Camera dei Deputati
- **SPARQL Endpoint:** `https://dati.camera.it/sparql`
- **Ontologia:** OCD (Ontologia Camera dei Deputati)
- **Documentazione:** https://dati.camera.it/ocd-rappresentazione-semantica-e-documentazione

### Senato della Repubblica
- _(Da implementare)_

## Struttura del Progetto

```
republicMCP/
├── docs/                       # Documentazione
│   ├── 01-ontologia-camera.md  # Ontologia della Camera
│   ├── 02-rappresentazione-semantica.md
│   ├── 03-sparql-endpoint.md
│   └── 04-query-examples.md    # Esempi di query SPARQL
├── src/                        # Codice sorgente
│   ├── index.ts                # Entry point del server MCP
│   ├── sparql/                 # Client SPARQL
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── tools/                  # Strumenti MCP
│   │   ├── deputati.ts
│   │   ├── atti.ts
│   │   ├── votazioni.ts
│   │   ├── governi.ts
│   │   └── custom-query.ts
│   └── types/                  # TypeScript types
│       └── ontology.ts
├── examples/                   # Esempi di utilizzo
└── package.json
```

## Strumenti MCP Disponibili

### 1. `search_deputati`
Cerca deputati per nome, cognome o legislatura.

**Parametri:**
- `nome` (opzionale): Nome del deputato
- `cognome` (opzionale): Cognome del deputato
- `legislatura` (opzionale): Numero della legislatura (es: "19")

### 2. `get_deputato_info`
Ottiene informazioni dettagliate su un deputato specifico.

**Parametri:**
- `uri`: URI del deputato

### 3. `search_atti`
Cerca atti parlamentari.

**Parametri:**
- `titolo` (opzionale): Parole chiave nel titolo
- `tipo` (opzionale): Tipo di atto
- `legislatura` (opzionale): Numero della legislatura
- `limit` (default: 20): Numero massimo di risultati

### 4. `get_atto_info`
Ottiene informazioni dettagliate su un atto parlamentare.

**Parametri:**
- `uri`: URI dell'atto

### 5. `get_votazioni`
Ottiene le votazioni più recenti o relative ad un atto specifico.

**Parametri:**
- `atto_uri` (opzionale): URI dell'atto
- `data_da` (opzionale): Data inizio (YYYYMMDD)
- `data_a` (opzionale): Data fine (YYYYMMDD)
- `limit` (default: 20): Numero massimo di risultati

### 6. `get_gruppi_parlamentari`
Ottiene la lista dei gruppi parlamentari per legislatura.

**Parametri:**
- `legislatura` (opzionale): Numero della legislatura (default: corrente)

### 7. `get_commissioni`
Ottiene la lista delle commissioni parlamentari.

**Parametri:**
- `legislatura` (opzionale): Numero della legislatura
- `tipo` (opzionale): Tipo di commissione

### 8. `get_governi`
Ottiene informazioni sui governi.

**Parametri:**
- `include_membri` (default: false): Include i membri del governo

### 9. `execute_sparql`
Esegue una query SPARQL personalizzata.

**Parametri:**
- `query`: Query SPARQL da eseguire
- `format` (default: "json"): Formato della risposta

## Installazione

```bash
cd mine/republicMCP
npm install
npm run build
```

## Modalità d'Uso

### 1. CLI Interattivo con Ollama (Consigliato)

Usa il linguaggio naturale per interrogare i dati:

```bash
# Setup Ollama
brew install ollama
ollama pull qwen2.5:14b

# Avvia il CLI
npm run cli
```

Poi chiedi:
- "Chi è Giorgia Meloni?"
- "Mostrami le ultime votazioni"
- "Quali sono i gruppi parlamentari?"

Vedi [CLI_USAGE.md](CLI_USAGE.md) per dettagli completi.

### 2. Web Interface

Interfaccia grafica per browser:

```bash
npm run web
```

Apri http://localhost:3000

### 3. Integrazione con Claude Desktop

Usa RepublicMCP direttamente con Claude Desktop.

Vedi [INSTALLATION.md](INSTALLATION.md) per la configurazione.

## Utilizzo con Claude Desktop

Aggiungi la seguente configurazione al file `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "republic": {
      "command": "node",
      "args": ["/path/to/republicMCP/dist/index.js"]
    }
  }
}
```

## Esempi di Utilizzo

### Cercare un deputato

```
User: Chi è la presidente del consiglio?
Assistant: [Usa search_deputati con cognome="Meloni"]
```

### Informazioni su un atto

```
User: Dimmi dello stato della legge di bilancio 2024
Assistant: [Usa search_atti con titolo="bilancio 2024"]
```

### Votazioni recenti

```
User: Quali sono state le ultime votazioni in aula?
Assistant: [Usa get_votazioni con limit=10]
```

## Documentazione

La documentazione completa dell'ontologia e degli endpoint è disponibile nella cartella `docs/`:

- [Ontologia Camera dei Deputati](docs/01-ontologia-camera.md)
- [Rappresentazione Semantica](docs/02-rappresentazione-semantica.md)
- [SPARQL Endpoint](docs/03-sparql-endpoint.md)
- [Esempi di Query](docs/04-query-examples.md)

## Roadmap

- [x] Documentazione ontologia Camera
- [x] Esempi di query SPARQL
- [ ] Implementazione server MCP base
- [ ] Tool per deputati
- [ ] Tool per atti parlamentari
- [ ] Tool per votazioni
- [ ] Tool per governi e commissioni
- [ ] Query SPARQL personalizzate
- [ ] Cache e ottimizzazioni
- [ ] Supporto Senato della Repubblica
- [ ] Test suite
- [ ] Docker container

## Licenza

MIT

## Contributi

Contributi benvenuti! Apri una issue o una pull request.

## Risorse

- [Camera dei Deputati - Dati Aperti](https://dati.camera.it/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)

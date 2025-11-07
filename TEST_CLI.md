# Test del CLI - RepublicMCP

## Test Rapido

Per testare il CLI interattivo con Ollama:

### 1. Verifica Ollama

```bash
# Controlla che Ollama sia installato e in esecuzione
ollama list

# Se non è installato:
brew install ollama

# Scarica il modello
ollama pull qwen2.5:14b
```

### 2. Avvia Ollama (se non è già running)

```bash
# In un terminale separato
ollama serve
```

### 3. Avvia il CLI

```bash
npm run cli
```

### 4. Testa con domande semplici

Una volta avviato il CLI, prova:

```
🏛️  > Chi è Giorgia Meloni?
```

Dovresti vedere:
1. 🤔 Analizzando la domanda...
2. 🤖 AI risponde con il tool e parametri
3. ⚙️  Chiamata al tool
4. ✓ Risultati mostrati

## Troubleshooting

### Se vedi "Ollama non disponibile"

```bash
# In un altro terminale
ollama serve
```

Poi prova di nuovo.

### Se vedi "Modello non trovato"

```bash
ollama pull qwen2.5:14b
```

### Se il server MCP non si connette

```bash
# Verifica che il build sia aggiornato
npm run build

# Riprova
npm run cli
```

## Test Senza Ollama

Se Ollama non funziona, usa il CLI basico:

```bash
npm run cli:basic
```

Poi usa comandi diretti:

```
/call search_deputati {"cognome": "Meloni"}
```

## Test Web Interface

Alternativa semplice senza Ollama:

```bash
npm run web
```

Apri http://localhost:3000 nel browser.

---

**Note**: Il CLI richiede Ollama in esecuzione. Se hai problemi, usa la web interface o integra con Claude Desktop.

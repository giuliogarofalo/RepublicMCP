# 🚀 RepublicMCP - START HERE

Benvenuto! Questo progetto ti permette di interrogare i dati aperti del Parlamento italiano usando linguaggio naturale.

## 🎯 Quickstart (5 minuti)

### Prerequisiti

```bash
# 1. Installa Ollama
brew install ollama

# 2. Scarica il modello AI
ollama pull qwen2.5:14b

# 3. Avvia Ollama (in un terminale separato)
ollama serve
```

### Installa e Avvia

```bash
# 4. Installa dipendenze
npm install
npm run build

# 5. Avvia il CLI interattivo
npm run cli
```

### Usa!

Ora puoi fare domande in italiano:

```
🏛️  > Chi è Giorgia Meloni?
🏛️  > Mostrami le ultime 5 votazioni
🏛️  > Quali sono i gruppi parlamentari?
🏛️  > Cerca deputati con cognome Rossi
```

## 📖 Documentazione

- **[QUICKSTART.md](QUICKSTART.md)** - Guida veloce completa
- **[CLI_USAGE.md](CLI_USAGE.md)** - Tutti i dettagli del CLI
- **[TEST_CLI.md](TEST_CLI.md)** - Come testare il CLI
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - Esempi di domande

## 🛠️ Alternative

### Non hai Ollama?

**Opzione 1: Web Interface**
```bash
npm run web
# Apri http://localhost:3000
```

**Opzione 2: Claude Desktop**
Vedi [INSTALLATION.md](INSTALLATION.md)

**Opzione 3: CLI Basico**
```bash
npm run cli:basic
# Usa comandi diretti tipo: /call search_deputati {"cognome": "Meloni"}
```

## 🔍 Cosa Puoi Fare

RepublicMCP ha 11 tools per interrogare:

- ✅ **Deputati**: Info biografiche, mandati, commissioni
- ✅ **Atti Parlamentari**: DDL, proposte, mozioni, iter
- ✅ **Votazioni**: Risultati, voti per/contro/astenuti
- ✅ **Governi**: Membri, deleghe, incarichi
- ✅ **Commissioni**: Composizione, organi parlamentari
- ✅ **Gruppi Parlamentari**: Lista e membri
- ✅ **Interventi**: Dibattiti in aula su temi specifici
- ✅ **Query SPARQL**: Query personalizzate avanzate

## 🆘 Problemi?

### Ollama non si connette
```bash
# Verifica che sia in esecuzione
ollama list

# Se non parte, avvialo manualmente
ollama serve
```

### Modello mancante
```bash
ollama pull qwen2.5:14b
```

### Build fallisce
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📚 Architettura

```
RepublicMCP
├── CLI con Ollama (linguaggio naturale)
│   └── qwen2.5:14b analizza domande → chiama tools MCP
│
├── Server MCP (11 tools)
│   └── Query SPARQL → Endpoint Camera dei Deputati
│
└── Dati Ufficiali
    └── https://dati.camera.it/sparql
```

## 🎓 Prossimi Passi

1. ✅ Testa il CLI con domande semplici
2. 📖 Leggi [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) per ispirazione
3. 🔧 Esplora i tools con `/tools` nel CLI
4. 📚 Studia l'ontologia in `docs/` per query avanzate
5. 🚀 Integra con Claude Desktop

## 💡 Tips

- **Domande specifiche** funzionano meglio: "Cerca deputati con cognome Rossi"
- **Usa parametri**: "Ultime 10 votazioni"
- **Combina info**: "Chi è presidente del consiglio e che atti ha presentato?"
- **Se bloccato**: Usa `/help` o prova la web interface

## 📞 Help

Documenti utili:
- Problemi Ollama → [TEST_CLI.md](TEST_CLI.md)
- Esempi domande → [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)
- Setup Claude → [INSTALLATION.md](INSTALLATION.md)
- Info progetto → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

**Buon divertimento esplorando i dati del Parlamento! 🏛️🇮🇹**

*Per dubbi o problemi, consulta la documentazione nella cartella `docs/`*

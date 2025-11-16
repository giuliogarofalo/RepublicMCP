# Changelog

Tutte le modifiche importanti a questo progetto saranno documentate in questo file.

## [0.1.0] - 2024-11-06

### Aggiunto
- ✅ Struttura iniziale del progetto
- ✅ Documentazione completa dell'ontologia OCD
- ✅ Client SPARQL per Camera dei Deputati
- ✅ Query Builder con query pre-costruite
- ✅ Server MCP con 11 tools:
  - `search_deputati` - Cerca deputati
  - `get_deputato_info` - Info dettagliate deputato
  - `search_atti` - Cerca atti parlamentari
  - `get_atto_info` - Info dettagliate atto
  - `get_votazioni` - Ottieni votazioni
  - `get_gruppi_parlamentari` - Lista gruppi
  - `get_commissioni` - Lista commissioni
  - `get_governi` - Info governi
  - `get_governo_membri` - Membri governo
  - `search_interventi` - Cerca interventi in aula
  - `execute_sparql` - Query SPARQL personalizzate
- ✅ TypeScript types per entità OCD
- ✅ Script di test per validare query
- ✅ Documentazione utente completa
- ✅ Esempi di utilizzo
- ✅ Guida installazione

### Documentazione
- ✅ README.md
- ✅ INSTALLATION.md
- ✅ USAGE_EXAMPLES.md
- ✅ PROJECT_SUMMARY.md
- ✅ docs/01-ontologia-camera.md
- ✅ docs/02-rappresentazione-semantica.md
- ✅ docs/03-sparql-endpoint.md
- ✅ docs/04-query-examples.md
- ✅ docs/05-query-examples-official.md

## [Planned] - Roadmap Futura

### v0.2.0 - Miglioramenti Base
- [ ] Supporto per Senato della Repubblica
- [ ] Aggiungere endpoint SPARQL del Senato
- [ ] Mappare ontologia del Senato
- [ ] Tools specifici per il Senato
- [ ] Query cross-camera (Camera + Senato)

### v0.3.0 - Performance e Cache
- [ ] Implementare cache Redis per query frequenti
- [ ] Rate limiting per proteggere l'endpoint
- [ ] Ottimizzazione query SPARQL
- [ ] Batch queries per ridurre chiamate
- [ ] Monitoring performance

### v0.4.0 - Features Avanzate
- [ ] Ricerca full-text migliorata
- [ ] Fuzzy matching per nomi
- [ ] Suggerimenti auto-completamento
- [ ] Export dati in CSV/Excel
- [ ] Export report PDF
- [ ] Grafici e visualizzazioni

### v0.5.0 - Testing e Qualità
- [ ] Test suite completa con Vitest
- [ ] Integration tests per endpoint SPARQL
- [ ] Test coverage > 80%
- [ ] CI/CD con GitHub Actions
- [ ] Linting automatico

### v0.6.0 - Deployment
- [ ] Docker container
- [ ] Docker Compose per sviluppo
- [ ] Kubernetes manifests
- [ ] Health checks
- [ ] Logging strutturato
- [ ] Metrics (Prometheus)

### v0.7.0 - Web Interface
- [ ] Dashboard web amministrativa
- [ ] Query builder visuale
- [ ] Visualizzazione risultati
- [ ] Grafici interattivi
- [ ] Export report

### v0.8.0 - Real-time Features
- [ ] WebSocket support
- [ ] Notifiche su nuovi atti
- [ ] Aggiornamenti votazioni live
- [ ] Stream di eventi parlamentari

### v0.9.0 - AI Features
- [ ] Riassunti automatici degli atti
- [ ] Analisi sentiment dei dibattiti
- [ ] Clustering tematici
- [ ] Trend analysis
- [ ] Predizioni (es. esito votazioni)

### v1.0.0 - Production Ready
- [ ] Documentazione completa API
- [ ] Security audit
- [ ] Performance tuning
- [ ] Scalability testing
- [ ] Production deployment guide
- [ ] Monitoring e alerting

## Ideas / Backlog

### Integrazioni
- [ ] Integrazione con sito camera.it per testi completi
- [ ] Link a Openpolis per dati aggiuntivi
- [ ] Integrazione con archivi storici
- [ ] API pubbliche per terze parti

### Features Utente
- [ ] Notifiche personalizzate (email, telegram)
- [ ] Salvataggio ricerche favorite
- [ ] Annotazioni su atti
- [ ] Confronto versioni testi
- [ ] Timeline visuale iter legislativi

### Analytics
- [ ] Dashboard statistiche legislative
- [ ] Analisi produttività deputati
- [ ] Analisi coerenza voti per gruppo
- [ ] Statistiche presenze commissioni
- [ ] Report attività parlamentare

### Multi-lingua
- [ ] Traduzioni interfaccia (EN, FR, DE)
- [ ] Documentazione multi-lingua
- [ ] Nomi proprietà ontologia in inglese

### Developer Experience
- [ ] SDK Python per RepublicMCP
- [ ] SDK JavaScript/TypeScript
- [ ] GraphQL API wrapper
- [ ] REST API wrapper
- [ ] CLI tool standalone

## Known Issues

### Limitazioni Correnti

1. **Dati non real-time**: L'endpoint SPARQL ha ritardi negli aggiornamenti
2. **No voti individuali**: Molte votazioni hanno solo dati aggregati
3. **Testi parziali**: I testi completi degli atti non sono nell'endpoint SPARQL
4. **Performance**: Query complesse possono essere lente
5. **No cache**: Ogni query va all'endpoint (da ottimizzare)

### Bug Noti

Nessun bug critico al momento.

### Workarounds

- Per dati real-time: integrare scraping del sito camera.it
- Per testi completi: usare API REST camera.it (non SPARQL)
- Per performance: implementare cache locale

## Contributing

Contributi benvenuti! Per favore:

1. Fai un fork del repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Aree dove contribuire

- 🐛 Bug fixes
- 📝 Miglioramenti documentazione
- ✨ Nuove features
- 🎨 Miglioramenti UX
- 🚀 Ottimizzazioni performance
- 🧪 Tests

## Versioning

Questo progetto usa [Semantic Versioning](https://semver.org/):
- MAJOR: breaking changes
- MINOR: nuove features (backward compatible)
- PATCH: bug fixes

## License

MIT License - vedi file LICENSE per dettagli

## Acknowledgments

- Camera dei Deputati per i dati aperti
- Anthropic per il Model Context Protocol
- Community open source per le librerie utilizzate

---

**Ultimo aggiornamento**: 6 Novembre 2024

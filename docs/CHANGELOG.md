# Changelog

Tutte le modifiche importanti a questo progetto saranno documentate in questo file.

## [0.3.0] - 2026-06-10

### Aggiunto
- ✅ Integrazione OpenPolis/Openparlamento: 7 tool aggiuntivi (indice di forza, votazioni, decreti-legge, profili parlamentari, organi) via OPDM REST API

## [0.2.0] - 2026-06-07

### Aggiunto
- ✅ Setup pubblicazione npm (`republic-mcp`): bin, files, publishConfig, CI workflow
- ✅ Modulo Senato della Repubblica completo: 11 tool (senatori, DDL con iter, votazioni, commissioni, gruppi) sull'ontologia OSR
- ✅ Supporto Docker per il server MCP
- ✅ Documentazione differenze ontologiche Camera (OCD) ↔ Senato (OSR) con esempi query-by-query
- ✅ Diagrammi TypeScript dei type system per entrambe le ontologie

## [0.1.0] - 2025-11-16

### Aggiunto
- ✅ Struttura iniziale del progetto e architettura core condivisa
- ✅ Documentazione completa dell'ontologia OCD
- ✅ Client SPARQL per Camera dei Deputati
- ✅ Query Builder con query pre-costruite
- ✅ Server MCP con 19 tool Camera:
  - `search_deputati` - Cerca deputati
  - `get_deputato_info` - Info dettagliate deputato
  - `get_deputato_mandati` - Mandati e storico deputato
  - `search_atti` - Cerca atti parlamentari
  - `get_atto_info` - Info dettagliate atto
  - `get_atti_deputato` - Atti per deputato (firmatario/co-firmatario)
  - `get_atti_con_fasi` - Atti con iter completo
  - `get_votazioni` - Votazioni recenti/filtrate
  - `get_espressioni_voto` - Espressioni di voto dettagliate
  - `get_statistiche_voto_deputato` - Statistiche di voto deputato
  - `get_gruppi_parlamentari` - Lista gruppi
  - `get_commissioni` - Lista commissioni
  - `get_incarichi_gruppi` - Incarichi nei gruppi
  - `get_incarichi_organi` - Incarichi nelle commissioni
  - `get_governi` - Info governi
  - `get_governo_membri` - Membri governo
  - `get_incarichi_governo` - Incarichi ministeriali
  - `search_interventi` - Cerca interventi in aula
  - `get_interventi_per_argomento` - Interventi per argomento
- ✅ TypeScript types per entità OCD
- ✅ Script di test per validare query
- ✅ Documentazione utente completa
- ✅ Esempi di utilizzo
- ✅ Guida installazione

### Documentazione
- ✅ README.md
- ✅ INSTALLATION.md
- ✅ docs/camera/*.md (ontologia, rappresentazione semantica, endpoint SPARQL, esempi)

## Roadmap futura

### Performance e Cache
- [ ] Implementare cache Redis per query frequenti
- [ ] Rate limiting per proteggere l'endpoint
- [ ] Ottimizzazione query SPARQL
- [ ] Batch queries per ridurre chiamate
- [ ] Monitoring performance

### Features Avanzate
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

**Ultimo aggiornamento**: 10 Giugno 2026 (v0.3.0)

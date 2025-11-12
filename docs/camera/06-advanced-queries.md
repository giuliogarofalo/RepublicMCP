# Query Avanzate - RepublicMCP

Questo documento descrive le nuove funzionalità avanzate aggiunte a RepublicMCP per supportare query complesse frequenti.

## Nuovi Tool MCP (8 tool aggiunti)

### 1. get_atti_con_fasi
**Descrizione**: Ottieni atti parlamentari con tutte le fasi di iter e date di approvazione

**Parametri**:
- `legislatura` (string, opzionale): Es. "repubblica_19"
- `data_da` (string, opzionale): Data inizio (formato: YYYYMMDD)
- `data_a` (string, opzionale): Data fine (formato: YYYYMMDD)
- `limit` (number, opzionale): Max risultati (default: 100)

**Esempi NL**:
- "Mostrami gli atti con tutte le fasi di iter"
- "Atti approvati nel 2023 con iter completo"
- "Fasi legislative degli atti della XIX legislatura"

**Query SPARQL Originale Mappata**: "tutti gli atti della Legislatura XVIII con relative fasi di iter ed eventuale data di approvazione"

---

### 2. get_atti_deputato
**Descrizione**: Ottieni atti presentati da un deputato come primo firmatario o cofirmatario

**Parametri**:
- `cognome` (string, **richiesto**): Cognome deputato
- `nome` (string, opzionale): Nome deputato
- `legislatura` (string, opzionale): Es. "repubblica_19"
- `ruolo` (string, opzionale): "primo_firmatario", "altro_firmatario", "both" (default: both)
- `limit` (number, opzionale): Max risultati (default: 100)

**Esempi NL**:
- "Quali atti ha presentato Meloni?"
- "Progetti di legge di Salvini come primo firmatario"
- "Mozioni presentate da Conte"

**Query SPARQL Originale Mappata**: "tutti gli atti (pdl, mozioni, etc.) presentati da un deputato come primo e altro firmatario"

---

### 3. get_espressioni_voto
**Descrizione**: Dettagli di voto di ogni deputato per una specifica votazione

**Parametri**:
- `data` (string, **richiesto**): Data votazione (formato: YYYYMMDD, es: "20140611")
- `numero` (string, **richiesto**): Numero votazione (es: "001")

**Esempi NL**:
- "Come hanno votato i deputati il 6 giugno 2014 votazione 001?"
- "Voti della prima votazione del 11 giugno 2014"
- "Chi ha votato favorevole il 20240315 votazione 015?"

**Query SPARQL Originale Mappata**: "tutte le espressioni di voto di una data votazione"

---

### 4. get_statistiche_voto_deputato
**Descrizione**: Statistiche sui voti di un deputato per tipo (favorevoli, contrari, astenuti, etc)

**Parametri**:
- `cognome` (string, **richiesto**): Cognome deputato
- `nome` (string, opzionale): Nome deputato
- `legislatura` (string, opzionale): Es. "repubblica_19"
- `tipo_voto` (string, opzionale): "Favorevole", "Contrario", "Astensione", "Ha votato", "Non ha votato"
- `data_da` (string, opzionale): Data inizio (formato: YYYYMM)
- `data_a` (string, opzionale): Data fine (formato: YYYYMM)

**Esempi NL**:
- "Quante volte Rossi si è astenuto?"
- "Statistiche voti contrari di Bianchi a settembre 2023"
- "Assenze di Verdi nelle votazioni"

**Query SPARQL Originale Mappata**: "numero dei voti per un tipo di espressione di voto per un gruppo di deputati"

---

### 5. get_incarichi_governo_deputati
**Descrizione**: Incarichi di governo ricoperti dai deputati (ministri, sottosegretari, etc)

**Parametri**:
- `legislatura` (string, opzionale): Es. "repubblica_19"
- `cognome` (string, opzionale): Per filtrare per deputato
- `nome` (string, opzionale): Per filtrare per deputato

**Esempi NL**:
- "Chi sono i ministri deputati?"
- "Incarichi di governo di Meloni"
- "Quali deputati hanno ruoli nel governo?"

**Query SPARQL Originale Mappata**: "tutti gli incarichi di governo di deputati della XIX Legislatura con i relativi estremi"

---

### 6. get_interventi_per_argomento
**Descrizione**: Cerca interventi in aula per argomento con possibilità di filtrare per deputato

**Parametri**:
- `argomento` (string, **richiesto**): Parola chiave (es: "immigrazione", "sanità")
- `legislatura` (string, opzionale): Es. "repubblica_18"
- `cognome` (string, opzionale): Per filtrare per deputato
- `nome` (string, opzionale): Per filtrare per deputato
- `limit` (number, opzionale): Max risultati (default: 50)

**Esempi NL**:
- "Interventi sull'immigrazione"
- "Chi ha parlato di sanità in aula?"
- "Interventi di Abrignani sull'ecologia"

**Query SPARQL Originale Mappata**: "Deputati intervenuti in Aula in materia di 'immigrazione' nella XVIII Legislatura" e "Interventi in Aula di un deputato specifico"

---

### 7. get_incarichi_gruppi_parlamentari
**Descrizione**: Incarichi nei gruppi parlamentari con date di inizio e fine

**Parametri**:
- `legislatura` (string, opzionale): Es. "repubblica_19"

**Esempi NL**:
- "Incarichi nei gruppi parlamentari"
- "Chi ha ruoli di leadership nei gruppi?"
- "Capigruppo e vice della XIX legislatura"

**Query SPARQL Originale Mappata**: "tutti gli incarichi nei gruppi parlamentari nella XIX Legislatura con i relativi estremi"

---

### 8. get_incarichi_organi_parlamentari
**Descrizione**: Incarichi negli organi parlamentari (commissioni, etc) con date

**Parametri**:
- `legislatura` (string, opzionale): Es. "repubblica_19"

**Esempi NL**:
- "Incarichi nelle commissioni parlamentari"
- "Presidenti di commissione"
- "Membri degli organi parlamentari"

**Query SPARQL Originale Mappata**: "tutti gli incarichi in organi parlamentari nella XIX Legislatura con i relativi estremi"

---

## Tool Esistenti Potenziati

I tool esistenti come `search_interventi` ora sono integrati con il nuovo `get_interventi_per_argomento` che offre più opzioni di filtraggio.

## Esempi di Conversazioni Complete

### Esempio 1: Analisi Completa Deputato
```
User: Chi è Giorgia Meloni?
AI: [chiama search_deputati]

User: Quali atti ha presentato?
AI: [chiama get_atti_deputato con cognome="Meloni"]

User: Ha ruoli nel governo?
AI: [chiama get_incarichi_governo_deputati con cognome="Meloni"]

User: Come vota di solito?
AI: [chiama get_statistiche_voto_deputato con cognome="Meloni"]
```

### Esempio 2: Ricerca Tematica
```
User: Interventi sull'immigrazione
AI: [chiama get_interventi_per_argomento con argomento="immigrazione"]

User: E gli atti legislativi su questo tema?
AI: [chiama search_atti con titolo="immigrazione"]

User: Quali sono le fasi di questi atti?
AI: [chiama get_atti_con_fasi con filtro su tema]
```

### Esempio 3: Analisi Votazione
```
User: Ultime votazioni
AI: [chiama get_votazioni con limit=5]

User: Come hanno votato i deputati il 20240315 votazione 001?
AI: [chiama get_espressioni_voto con data="20240315", numero="001"]

User: Statistiche astenuti per Rossi
AI: [chiama get_statistiche_voto_deputato con cognome="Rossi", tipo_voto="Astensione"]
```

## Mapping Query SPARQL Originali

| Query Originale | Nuovo Tool MCP | Parametri Chiave |
|----------------|----------------|------------------|
| Atti con fasi iter e approvazione | `get_atti_con_fasi` | legislatura, date |
| Atti presentati da deputato | `get_atti_deputato` | cognome, ruolo |
| Espressioni voto per votazione | `get_espressioni_voto` | data, numero |
| Statistiche voto deputato | `get_statistiche_voto_deputato` | cognome, tipo_voto |
| Incarichi governo deputati | `get_incarichi_governo_deputati` | legislatura |
| Interventi per argomento | `get_interventi_per_argomento` | argomento |
| Incarichi gruppi parlamentari | `get_incarichi_gruppi_parlamentari` | legislatura |
| Incarichi organi parlamentari | `get_incarichi_organi_parlamentari` | legislatura |

## Formato Date

- **YYYYMMDD**: Per date precise (es: "20240315" = 15 marzo 2024)
- **YYYYMM**: Per mesi (es: "202403" = marzo 2024)
- **YYYY**: Per anni (es: "2024")

## Legislature Disponibili

- `repubblica_19`: XIX Legislatura (corrente, dal 2022)
- `repubblica_18`: XVIII Legislatura (2018-2022)
- `repubblica_17`: XVII Legislatura (2013-2018)
- `repubblica_16`: XVI Legislatura (2008-2013)

## Limiti e Performance

- **Default limit**: Varia per tool (20-100 risultati)
- **Max limit**: 10000 per alcuni tool
- **Performance**: Query complesse possono richiedere 3-10 secondi
- **Caching**: Endpoint SPARQL può cachare risultati frequenti

## Best Practices

1. **Specificare sempre la legislatura** se cerchi dati storici
2. **Usare filtri per date** per ridurre risultati nelle query pesanti
3. **Combinare tool** per analisi complete (es: cerca deputato → atti → voti)
4. **Limitare risultati** con `limit` per query esplorative
5. **Usare cognome completo** per evitare ambiguità (es: "Meloni" invece di "Mel")

## Come Testare

```bash
npm run cli
```

Poi prova:
- "Quali atti ha presentato Anzaldi?"
- "Interventi sull'immigrazione nella XVIII legislatura"
- "Statistiche voti astenuti di Rossi"
- "Chi sono i ministri deputati?"
- "Atti con iter completo del 2023"

## Totale Tool Disponibili

Ora RepublicMCP offre **19 tool MCP** (11 originali + 8 nuovi):

1. search_deputati
2. get_deputato_info
3. search_atti
4. get_atto_info
5. get_votazioni
6. get_gruppi_parlamentari
7. get_commissioni
8. get_governi
9. get_governo_membri
10. search_interventi
11. execute_sparql
12. **get_atti_con_fasi** ⭐
13. **get_atti_deputato** ⭐
14. **get_espressioni_voto** ⭐
15. **get_statistiche_voto_deputato** ⭐
16. **get_incarichi_governo_deputati** ⭐
17. **get_interventi_per_argomento** ⭐
18. **get_incarichi_gruppi_parlamentari** ⭐
19. **get_incarichi_organi_parlamentari** ⭐

## Prossimi Sviluppi Possibili

- [ ] Aggregazioni e statistiche avanzate
- [ ] Confronti tra legislature
- [ ] Timeline eventi legislativi
- [ ] Grafici e visualizzazioni
- [ ] Export dati in CSV/JSON
- [ ] Integrazione Senato della Repubblica
- [ ] Query multi-step automatiche

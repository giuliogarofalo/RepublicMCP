# RepublicMCP - Project Summary

## Cosa è stato creato

Un server MCP (Model Context Protocol) completo per interrogare i dati aperti del Parlamento italiano (Camera dei Deputati) attraverso l'endpoint SPARQL ufficiale.

## Struttura del Progetto

```
republicMCP/
├── docs/                               # Documentazione completa
│   ├── 01-ontologia-camera.md          # Ontologia OCD
│   ├── 02-rappresentazione-semantica.md # Architettura semantica
│   ├── 03-sparql-endpoint.md           # Info endpoint
│   ├── 04-query-examples.md            # Query di esempio create
│   └── 05-query-examples-official.md   # Query ufficiali dal sito
│
├── src/                                # Codice sorgente TypeScript
│   ├── index.ts                        # Server MCP principale
│   ├── sparql/
│   │   ├── client.ts                   # Client SPARQL
│   │   └── queries.ts                  # Query builder
│   └── types/
│       └── ontology.ts                 # TypeScript types
│
├── examples/
│   └── test-queries.ts                 # Script di test
│
├── dist/                               # Codice compilato (generato)
├── README.md                           # Documentazione utente
├── INSTALLATION.md                     # Guida installazione
├── package.json                        # Dipendenze e scripts
└── tsconfig.json                       # Config TypeScript
```

## Tools MCP Implementati

Il server espone 11 tools MCP:

### 1. **search_deputati**
Cerca deputati per nome, cognome o legislatura con info biografiche e gruppo parlamentare.

### 2. **get_deputato_info**
Dettagli completi su un deputato specifico (mandati, commissioni, incarichi).

### 3. **search_atti**
Cerca atti parlamentari (ddl, mozioni) per titolo, tipo o legislatura.

### 4. **get_atto_info**
Dettagli su un atto specifico (iter, proponenti, votazioni).

### 5. **get_votazioni**
Votazioni recenti o relative ad un atto specifico.

### 6. **get_gruppi_parlamentari**
Lista dei gruppi parlamentari per legislatura.

### 7. **get_commissioni**
Lista delle commissioni e organi parlamentari.

### 8. **get_governi**
Informazioni sui governi della Repubblica.

### 9. **get_governo_membri**
Membri di un governo specifico.

### 10. **search_interventi**
Cerca interventi in aula su un argomento specifico.

### 11. **execute_sparql**
Esegue query SPARQL personalizzate (per utenti avanzati).

## Tecnologie Utilizzate

- **TypeScript** - Linguaggio principale
- **Node.js** ≥18 - Runtime
- **@modelcontextprotocol/sdk** - Framework MCP
- **sparql-http-client** - Client SPARQL
- **Zod** - Validazione schema

## Endpoint SPARQL

- **URL**: `https://dati.camera.it/sparql`
- **Tipo**: Virtuoso SPARQL Endpoint
- **Formati**: JSON, XML, CSV, Turtle, RDF/XML

## Ontologia OCD

L'ontologia della Camera dei Deputati (OCD) modella:

- **Deputati e Persone**: Anagrafica, mandati, elezioni
- **Atti Parlamentari**: DDL, proposte, mozioni, iter legislativo
- **Votazioni**: Voti, risultati, voti individuali
- **Organi**: Commissioni, gruppi parlamentari
- **Governi**: Composizione, ministri, deleghe
- **Sedute e Dibattiti**: Interventi, discussioni

## Prefissi Principali

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX bio: <http://purl.org/vocab/bio/0.1/>
```

## Come Usare

### 1. Installazione

```bash
cd /Users/giuliogarofalo/mine/republicMCP
npm install
npm run build
```

### 2. Test

```bash
npx tsx examples/test-queries.ts
```

### 3. Configurazione Claude Desktop

Aggiungi a `claude_desktop_config.json`:

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

### 4. Utilizzo

Dopo il riavvio di Claude Desktop, puoi fare domande come:

- "Chi è il presidente del consiglio?"
- "Mostrami gli ultimi disegni di legge sulla sanità"
- "Quali sono state le ultime votazioni?"
- "Chi sono i membri della commissione bilancio?"
- "Cerca interventi in aula sul tema immigrazione"

Claude userà automaticamente i tools MCP per rispondere.

## Esempi di Query

### Deputati con cognome specifico

```sparql
SELECT DISTINCT ?deputato ?cognome ?nome ?nomeGruppo
WHERE {
  ?deputato a ocd:deputato;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    foaf:surname ?cognome;
    foaf:firstName ?nome.
  FILTER(REGEX(?cognome, 'Meloni', 'i'))
}
```

### Atti recenti

```sparql
SELECT ?atto ?titolo ?presentazione
WHERE {
  ?atto a ocd:atto;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    dc:title ?titolo;
    dc:date ?presentazione.
}
ORDER BY DESC(?presentazione)
LIMIT 20
```

### Votazioni con risultati

```sparql
SELECT ?votazione ?data ?favorevoli ?contrari ?astenuti
WHERE {
  ?votazione a ocd:votazione;
    dc:date ?data;
    ocd:favorevoli ?favorevoli;
    ocd:contrari ?contrari;
    ocd:astenuti ?astenuti.
}
ORDER BY DESC(?data)
LIMIT 20
```

## Caratteristiche Avanzate

### Query Builder
La classe `QueryBuilder` fornisce metodi per costruire query comuni:
- `getCurrentDeputies()` - Deputati in carica
- `searchActs()` - Cerca atti
- `getVotings()` - Ottieni votazioni
- E altri...

### Client SPARQL
`CameraSparqlClient` gestisce:
- Query SELECT, CONSTRUCT, ASK
- Parsing risultati
- Gestione errori

### Type Safety
Tutti i dati hanno types TypeScript definiti in `types/ontology.ts`:
- `Deputy`, `ParliamentaryAct`, `Voting`, etc.

## Prossimi Sviluppi

- [ ] Supporto Senato della Repubblica
- [ ] Cache Redis per performance
- [ ] Rate limiting
- [ ] Più query predefinite
- [ ] Ricerca full-text migliorata
- [ ] Export dati in vari formati
- [ ] WebSocket per aggiornamenti real-time
- [ ] Dashboard web amministrativa
- [ ] Test suite completa
- [ ] Docker container

## Licenza

MIT

## Contatti

Progetto creato da Giulio Garofalo

## Risorse Utili

- [Camera dei Deputati - Dati Aperti](https://dati.camera.it/)
- [Ontologia OCD](https://dati.camera.it/ocd-ontologia-della-camera-dei-deputati)
- [SPARQL Endpoint](https://dati.camera.it/sparql)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [SPARQL 1.1 Spec](https://www.w3.org/TR/sparql11-query/)

## Note Tecniche

### Legislature
- XIX Legislatura (corrente): `repubblica_19`
- XVIII Legislatura: `repubblica_18`
- XVII Legislatura: `repubblica_17`

### Formato Date
Date in formato `YYYYMMDD` (es: `20231015`)

### Performance
- Usa `LIMIT` nelle query per performance
- Filtra per legislatura quando possibile
- Considera cache per query frequenti

### Troubleshooting

**Build fails**: Verifica Node.js ≥18 e `npm install`

**Query fails**: Verifica connessione internet e endpoint raggiungibile

**Claude non vede i tools**: Riavvia Claude Desktop dopo config

---

**Status**: ✅ Progetto completato e funzionante
**Versione**: 0.1.0
**Data**: Novembre 2024

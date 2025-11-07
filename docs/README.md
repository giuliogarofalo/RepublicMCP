# Documentazione RepublicMCP

Questa cartella contiene la documentazione completa del progetto RepublicMCP, incluse le informazioni sull'ontologia OCD (Ontologia Camera dei Deputati) e gli esempi di query SPARQL.

## Indice

### 1. [Ontologia Camera dei Deputati](01-ontologia-camera.md)

Documentazione completa dell'ontologia OCD che descrive:
- Classi principali (deputato, atto, votazione, governo, etc.)
- Proprietà e relazioni
- Struttura gerarchica
- URI patterns
- Vocabolari integrati (FOAF, Dublin Core, BIO, etc.)

**Leggi questo per**: Capire la struttura dei dati e come sono organizzati.

---

### 2. [Rappresentazione Semantica](02-rappresentazione-semantica.md)

Architettura e specifiche tecniche:
- Struttura URI delle risorse
- Vocabolari internazionali utilizzati
- Dataset disponibili (14 categorie)
- Metodi di accesso tecnici
- Allineamenti con dataset esterni (DBpedia, Wikidata, etc.)

**Leggi questo per**: Comprendere l'architettura tecnica e i collegamenti esterni.

---

### 3. [SPARQL Endpoint](03-sparql-endpoint.md)

Informazioni sull'endpoint SPARQL:
- URL dell'endpoint
- Formati supportati
- Query di esempio base
- Configurazione del server (Virtuoso)

**Leggi questo per**: Informazioni base sull'endpoint e come interrogarlo.

---

### 4. [Query Examples - Custom](04-query-examples.md)

Raccolta di query SPARQL create per questo progetto:
- Query sui deputati
- Query sugli atti parlamentari
- Query sulle votazioni
- Query sui governi
- Query sugli organi parlamentari
- Query complesse e aggregate

**Leggi questo per**: Esempi pratici pronti all'uso per casi comuni.

---

### 5. [Query Examples - Official](05-query-examples-official.md)

Query SPARQL ufficiali estratte dal sito della Camera dei Deputati:
- Deputati in carica con info complete
- Incarichi in organi e gruppi
- Atti con iter completo
- Votazioni e espressioni di voto
- Interventi in aula su tematiche
- Bibliografia del Parlamento (BPR)

**Leggi questo per**: Query validate e utilizzate ufficialmente dalla Camera.

---

## Quick Start

### Per Sviluppatori

Se vuoi capire come interrogare i dati:

1. Inizia con [03-sparql-endpoint.md](03-sparql-endpoint.md) per l'endpoint
2. Leggi [01-ontologia-camera.md](01-ontologia-camera.md) per capire la struttura
3. Esplora [04-query-examples.md](04-query-examples.md) per esempi pratici

### Per Data Scientists

Se vuoi analizzare i dati:

1. Consulta [02-rappresentazione-semantica.md](02-rappresentazione-semantica.md) per i dataset
2. Studia [01-ontologia-camera.md](01-ontologia-camera.md) per le proprietà
3. Usa [05-query-examples-official.md](05-query-examples-official.md) come base

### Per Utenti MCP

Se vuoi usare il server MCP:

1. Leggi velocemente [01-ontologia-camera.md](01-ontologia-camera.md) per familiarizzare
2. Consulta gli esempi in [04-query-examples.md](04-query-examples.md)
3. Torna qui per riferimenti quando necessario

---

## Prefissi SPARQL Comuni

Per riferimento rapido, questi sono i prefissi più usati nelle query:

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX bio: <http://purl.org/vocab/bio/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
```

## Risorse Esterne

- [Sito ufficiale dati aperti Camera](https://dati.camera.it/)
- [Editor SPARQL online](https://dati.camera.it/sparql)
- [Camera.it](https://www.camera.it/)
- [SPARQL 1.1 Specification](https://www.w3.org/TR/sparql11-query/)

## Contribuire alla Documentazione

Se trovi errori o vuoi migliorare la documentazione:

1. Apri una issue descrivendo il problema
2. Proponi una modifica con una pull request
3. Assicurati di mantenere la formattazione Markdown

---

**Ultima modifica**: 6 Novembre 2024

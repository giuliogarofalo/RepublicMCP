# OSR - Rappresentazione Semantica e Documentazione

**Source:** https://dati.senato.it

## Overview
Il Senato della Repubblica pubblica dati parlamentari strutturati come Linked Open Data attraverso l'ontologia **OSR (Ontologia del Senato della Repubblica)** all'URL base `https://dati.senato.it/osr/`.

## Architettura Core

**Base Ontologia:** Formato RDF/OWL con namespace prefix `osr`

**Struttura URI Primaria:** `http://dati.senato.it/osr/` seguito da pattern specifici per classe:
- Senatori: Pattern URI specifico per senatore
- Disegni di Legge (DDL): Pattern basato su ID e fase
- Votazioni: Pattern basato su legislature e numero
- Commissioni: Pattern basato su categoria e numero ordinale

## Vocabolari Integrati

L'ontologia incorpora standard internazionali consolidati:

- **FOAF** (Friend of a Friend): Descrizioni di persone e relazioni
  - ⚠️ **Differenza critica**: Usa `foaf:lastName` invece di `foaf:surname`
- **Dublin Core (dc/dcterms)**: Metadati per tutte le risorse
- **RDF Schema (rdfs)**: Label e descrizioni base
- **XSD**: Tipi di dati standard

## Integrazione con Ontologia Camera (OCD)

**Importante**: Il Senato utilizza un approccio **ibrido** per i gruppi parlamentari:
- **Classi**: Usa classi dell'ontologia Camera (`ocd:gruppoParlamentare`, `ocd:adesioneGruppo`)
- **Proprietà**: Usa proprietà OSR (`osr:gruppo`, `osr:inizio`, `osr:fine`)

Questo garantisce interoperabilità tra i due rami del Parlamento mantenendo specificità del Senato.

## Risorse Dati Disponibili

Il sistema espone categorie di dataset primari:

1. **Senatori** - Record anagrafici e biografici collegati ai mandati parlamentari
2. **Mandati** - Mandati elettorali, senatori a vita, e affiliazioni di gruppo
3. **Disegni di Legge (DDL)** - Workflow legislativo completo dalla presentazione all'approvazione
4. **Iniziative** - Presentatori e firmatari di DDL
5. **Iter Legislativo** - Fasi di approvazione e storia procedimenti
6. **Votazioni** - Votazioni elettroniche con posizioni individuali dei senatori
7. **Commissioni** - Strutture organizzative e membership
8. **Gruppi Parlamentari** - Composizione e storia (integrazione con OCD)
9. **Sedute** - Verbali assemblea e commissioni
10. **Interventi** - Discorsi in aula collegati ai senatori
11. **Documenti** - Pubblicazioni ufficiali
12. **Sindacato Ispettivo** - Interrogazioni e mozioni di controllo

## Metodi di Accesso Tecnici

**SPARQL Endpoint:** `https://dati.senato.it/sparql`

**Formati Export Supportati:**
- RDF/XML, Turtle, N-Triples, JSON-LD
- CSV, TSV
- SPARQL-specific formats (XML, JSON)

**Serializzazione RDF:**
Le risorse supportano content negotiation restituendo sia HTML leggibile che RDF machine-readable basato su HTTP Accept headers.

## Caratteristiche Distintive OSR

### 1. Legislature come Numeri Interi
A differenza della Camera che usa URI completi, il Senato rappresenta le legislature come numeri interi:
```sparql
# Senato
?mandato osr:legislatura 19 .

# vs Camera
?mandato ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19> .
```

### 2. Proprietà Date Specifiche
Il Senato usa proprietà date dedicate:
```sparql
# Senato
?mandato osr:inizio ?dataInizio ;
         osr:fine ?dataFine .

# vs Camera
?mandato ocd:startDate ?dataInizio ;
         ocd:endDate ?dataFine .
```

### 3. Formato Date
Le date sono tipicamente in formato ISO string invece di integer YYYYMMDD usato dalla Camera.

### 4. Senatori a Vita
Il Senato ha una classe specifica per i mandati di senatori a vita:
- `ordinario` - Senatori eletti
- `a vita, di nomina del Presidente della Repubblica` - Nominati dal Presidente
- `di diritto e a vita, Presidente emerito della Repubblica` - Ex Presidenti della Repubblica

## Standard Metadati

Tutte le risorse includono descrittori Dublin Core (title, date, type, description) e informazioni di provenienza. Le proprietà collegano alle pagine sorgente autorevoli su senato.it.

## Filosofia Risoluzione URI

Seguendo i principi "Cool URIs for the Semantic Web": tutti gli URI OSR performano "semantic resolution" restituendo contenuto sia leggibile che machine-readable.

## Struttura Dati Temporale

Le classi incorporano range di date usando proprietà `osr:inizio` e `osr:fine` (formato date ISO), abilitando tracking storico attraverso 19+ legislature dalla Repubblica Italiana (dal 1948).

## Licenza

I dati del Senato sono pubblicati sotto licenza **Creative Commons Attribution 3.0** (CC BY 3.0), permettendo riuso libero con attribuzione.

---

**Ultimo aggiornamento**: 2025-11-12
**Fonte**: https://dati.senato.it

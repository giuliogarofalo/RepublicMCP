# Documentazione Senato della Repubblica

Documentazione completa per l'integrazione con i dati aperti del Senato della Repubblica Italiana.

## 📚 Indice Documentazione

### 1. [Ontologia Senato Ufficiale](./01-ontologia-senato-ufficiale.md)
Documentazione completa dell'ontologia OSR (Ontologia del Senato della Repubblica) basata sulla fonte ufficiale.

**Contenuto:**
- 20+ classi principali (Senatore, Ddl, Votazione, Commissione, etc.)
- 90+ proprietà documentate
- Prefissi e namespace
- Esempi TypeScript
- Pattern SPARQL comuni

**Fonte:** https://dati.senato.it/DatiSenato/browse/21

### 2. [Esempi Query SPARQL](./02-esempi-query-senato.md)
25 query SPARQL pronte all'uso per interrogare l'endpoint del Senato.

**Categorie:**
- Senatori (ricerca, legislature, senatori a vita)
- Disegni di Legge (DDL per senatore, stato, iter)
- Votazioni (recenti, per senatore, statistiche)
- Commissioni (composizione, membership)
- Gruppi Parlamentari (composizione, storia)
- Query Avanzate (profili completi, confronti)

### 3. [Differenze Camera-Senato](./03-differenze-camera-senato.md)
Guida completa alle differenze tra ontologia Camera (OCD) e Senato (OSR).

**Sezioni chiave:**
- Tabelle comparative proprietà
- Query side-by-side
- Checklist migrazione query
- Strategia implementazione multi-istituzione
- Elementi condivisi e riutilizzabili

---

## 🔗 Quick Links

| Risorsa | URL |
|---------|-----|
| **SPARQL Endpoint** | https://dati.senato.it/sparql |
| **Ontologia Ufficiale** | https://dati.senato.it/DatiSenato/browse/21 |
| **Dati Aperti Senato** | https://dati.senato.it |
| **Licenza** | Creative Commons Attribution 3.0 |

---

## 🚀 Quick Start

### 1. Test Endpoint

```bash
# Esplora l'endpoint
node explore-senato.js

# Test query senatori
node explore-senato-senatori.js
```

### 2. Query di Base

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

# Senatori in carica
SELECT DISTINCT ?senatore ?cognome ?nome
WHERE {
    ?senatore a osr:Senatore ;
        foaf:lastName ?cognome ;      # ⚠️ lastName, non surname!
        foaf:firstName ?nome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura 19 .     # ⚠️ Numero intero, non URI!
    OPTIONAL { ?mandato osr:fine ?fine }
    FILTER(!bound(?fine))
}
LIMIT 10
```

### 3. Prefissi Comuni

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>  # Per gruppi parlamentari
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
```

---

## ⚠️ Differenze Critiche con Camera

### 1. Cognome
```sparql
# Camera
?deputato foaf:surname ?cognome .

# Senato
?senatore foaf:lastName ?cognome .  # ← DIVERSO!
```

### 2. Legislatura
```sparql
# Camera - URI completo
?mandato ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19> .

# Senato - numero intero
?mandato osr:legislatura 19 .  # ← DIVERSO!
```

### 3. Date
```sparql
# Camera
?mandato ocd:startDate ?inizio ;
    ocd:endDate ?fine .

# Senato
?mandato osr:inizio ?inizio ;  # ← DIVERSO!
    osr:fine ?fine .           # ← DIVERSO!
```

### 4. Gruppi Parlamentari (CONDIVISI)
```sparql
# Entrambi usano classi Camera per gruppi!
?membro ocd:aderisce ?adesione .
?adesione a ocd:adesioneGruppo .

# Ma Senato usa proprietà OSR per le relazioni
?adesione osr:gruppo ?gruppo ;  # Senato
    osr:inizio ?inizio .

?adesione ocd:rif_gruppoParlamentare ?gruppo ;  # Camera
    ocd:startDate ?inizio .
```

---

## 📊 Struttura Dati Principale

### Senatore
```typescript
interface Senatore {
  uri: string;
  firstName: string;
  lastName: string;  // NON surname!
  photo?: string;
  birthDate?: string;
  birthCity?: string;
  mandates: Mandate[];
  commissions?: CommissionMembership[];
  groups?: GroupMembership[];
}
```

### Mandato
```typescript
interface Mandate {
  legislature: number;  // Integer, NON URI!
  start: string;
  end?: string;
  type: 'ordinario' | 'a vita, di nomina...' | 'di diritto...';
}
```

### DDL (Disegno di Legge)
```typescript
interface Ddl {
  idDdl: number;
  title: string;
  presentationDate: string;
  status: string;
  sponsors: Initiative[];
  iter?: IterDdl;
}
```

### Votazione
```typescript
interface Votazione {
  numero: string;
  date: string;
  oggetto: string;
  esito: string;
  favorevoli: number;
  contrari: number;
  astenuti: number;
  presenti: number;
}
```

---

## 🔍 Esempi Pratici

### Cerca Senatore
```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?senatore ?cognome ?nome
WHERE {
    ?senatore a osr:Senatore ;
        foaf:lastName ?cognome ;
        foaf:firstName ?nome .

    FILTER(REGEX(?cognome, "SALVINI", "i"))
}
```

### DDL Presentati da Senatore
```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?ddl ?titolo ?dataPres
WHERE {
    ?senatore foaf:lastName "SALVINI" ;
        foaf:firstName "Matteo" .

    ?iniziativa osr:presentatore ?senatore .

    ?ddl osr:iniziativa ?iniziativa ;
        osr:titolo ?titolo ;
        osr:dataPresentazione ?dataPres .
}
ORDER BY DESC(?dataPres)
```

### Votazioni Recenti
```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?votazione ?data ?oggetto ?esito
WHERE {
    ?votazione a osr:Votazione ;
        osr:seduta/osr:dataSeduta ?data ;
        rdfs:label ?oggetto ;
        osr:esito ?esito .

    FILTER(xsd:date(?data) >= xsd:date("2024-01-01"))
}
ORDER BY DESC(?data)
LIMIT 20
```

---

## 🛠️ Pattern Comuni

### Filtrare Mandati Attivi
```sparql
?mandato osr:inizio ?inizio .
OPTIONAL { ?mandato osr:fine ?fine }
FILTER(!bound(?fine))  # Solo mandati senza data fine (attivi)
```

### Filtrare per Legislatura
```sparql
?mandato osr:legislatura 19 .  # XIX Legislatura (2022-oggi)
```

### Filtrare per Data
```sparql
FILTER(xsd:date(str(?data)) >= xsd:date("2023-01-01"))
FILTER(xsd:date(str(?data)) <= xsd:date("2023-12-31"))
```

### Ricerca Case-Insensitive
```sparql
FILTER(REGEX(?cognome, "salvini", "i"))  # 'i' flag = case-insensitive
```

---

## 📈 Legislature Disponibili

| Legislatura | Numero | Periodo | Status |
|-------------|--------|---------|--------|
| **XIX** | 19 | 2022-presente | ✅ Corrente |
| **XVIII** | 18 | 2018-2022 | Completa |
| **XVII** | 17 | 2013-2018 | Completa |
| **XVI** | 16 | 2008-2013 | Completa |
| Precedenti | 1-15 | 1948-2008 | Disponibili |

---

## 🎯 Classi Principali (20 Totali)

### Persone e Organi
- `osr:Senatore` - Senatori
- `osr:Commissione` - Commissioni
- `osr:ConsiglioDiPresidenza` - Consiglio di presidenza

### Atti Legislativi
- `osr:Ddl` - Disegni di legge
- `osr:Atto` - Atti generici
- `osr:Documento` - Documenti non legislativi
- `osr:SindacatoIspettivo` - Sindacato ispettivo

### Processo Legislativo
- `osr:IterDdl` - Iter del DDL
- `osr:FaseIter` - Fasi dell'iter
- `osr:Iniziativa` - Firmatari/sponsor
- `osr:Assegnazione` - Assegnazioni commissioni
- `osr:Relatore` - Relatori
- `osr:Emendamento` - Emendamenti

### Attività Parlamentare
- `osr:SedutaAssemblea` - Sedute assemblea
- `osr:SedutaCommissione` - Sedute commissioni
- `osr:Votazione` - Votazioni
- `osr:Intervento` - Interventi

### Supporto
- `osr:Denominazione` - Denominazioni
- `osr:Procedura` - Procedure
- `osr:OggettoTrattazione` - Oggetti trattazione

---

## 📝 Entity Count (Approssimativo)

| Classe | Count |
|--------|-------|
| Classificazione | ~870K |
| Iniziativa | ~837K |
| Emendamento | ~695K |
| Assegnazione | ~360K |
| Intervento | ~296K |
| Atto | ~170K |
| SedutaCommissione | ~73K |
| FaseIter | ~73K |
| SindacatoIspettivo | ~65K |
| Relatore | ~55K |

---

## 🧪 Testing

### Script Disponibili

```bash
# Esplora tipi entità
node explore-senato.js

# Test query senatori
node explore-senato-senatori.js

# Test specifico (crea il tuo)
node test-senato-votazioni.js
```

### Test Query Online
1. Vai a https://dati.senato.it/sparql
2. Copia query da `02-esempi-query-senato.md`
3. Esegui e verifica risultati

---

## 🏗️ Workflow Implementazione RepublicMCP

### Architettura Codice

```
src/institutions/senato/
├── ontology/
│   ├── prefixes.ts      # Prefissi OSR e URI builder
│   └── types.ts         # TypeScript types
├── queries/
│   ├── senatori.ts      # Query senatori
│   ├── ddl.ts           # Query DDL
│   ├── votazioni.ts     # Query votazioni
│   ├── commissioni.ts   # Query commissioni
│   ├── gruppi.ts        # Query gruppi parlamentari
│   └── index.ts         # Export centrale
├── tools/
│   ├── senatori.tools.ts         # MCP tools senatori
│   ├── ddl.tools.ts              # MCP tools DDL
│   ├── votazioni.tools.ts        # MCP tools votazioni
│   ├── commissioni-gruppi.tools.ts  # MCP tools commissioni/gruppi
│   └── index.ts                  # Export centrale
├── client.ts            # SPARQL client Senato
└── index.ts             # Export modulo
```

### Esempio: Query Senatore

**1. TypeScript Types** (`ontology/types.ts`)
```typescript
export interface SenatoreSearchParams {
  lastName?: string;
  firstName?: string;
  legislature?: number;
  active?: boolean;
  mandateType?: string;
  limit?: number;
}
```

**2. Query Builder** (`queries/senatori.ts`)
```typescript
export class SenatoSenatoriQueries {
  static searchSenators(params: SenatoreSearchParams): string {
    return `
      SELECT ?senatore ?cognome ?nome ?legislatura
      WHERE {
        ?senatore a osr:Senatore ;
          foaf:lastName ?cognome ;          # ⚠️ lastName, NON surname!
          foaf:firstName ?nome ;
          osr:mandato ?mandato .

        ?mandato osr:legislatura ?legislatura .  # ⚠️ Numero intero!

        ${params.active ? 'OPTIONAL { ?mandato osr:fine ?fine } FILTER(!bound(?fine))' : ''}
        ${params.lastName ? `FILTER(REGEX(?cognome, "${params.lastName}", "i"))` : ''}
      }
      ORDER BY ?cognome ?nome
      LIMIT ${params.limit || 100}
    `;
  }
}
```

**3. MCP Tool** (`tools/senatori.tools.ts`)
```typescript
{
  name: 'search_senatori',
  description: 'Cerca senatori del Senato per nome, cognome o legislatura',
  inputSchema: {
    type: 'object',
    properties: {
      cognome: { type: 'string', description: 'Cognome senatore' },
      nome: { type: 'string', description: 'Nome senatore' },
      legislatura: { type: 'number', description: 'Numero legislatura (default: 19)' }
    }
  }
}
```

**4. Utilizzo CLI**
```bash
🏛️  > Cerca senatori con cognome Salvini
→ AI traduce in: search_senatori({ cognome: "Salvini" })
→ Query SPARQL eseguita su endpoint Senato
→ Risultato: SALVINI MATTEO (legislatura 19)
```

### Implementazione Status

✅ **Completato:**
- TypeScript types per tutte le classi
- Query builders per senatori, DDL, votazioni, commissioni, gruppi
- MCP tools completi (10+ tools)
- SPARQL client Senato
- Integrazione nel sistema RepublicMCP

🚀 **In Uso:**
- Sistema funzionante e testato
- Tools disponibili tramite CLI
- Documentazione completa

---

## 📚 Riferimenti

### Documentazione Ufficiale
- **Ontologia**: https://dati.senato.it/DatiSenato/browse/21
- **SPARQL Endpoint**: https://dati.senato.it/sparql
- **Dati Aperti**: https://dati.senato.it

### Ontologie Standard
- **FOAF**: http://xmlns.com/foaf/spec/
- **Dublin Core**: http://purl.org/dc/elements/1.1/
- **BIO**: http://purl.org/vocab/bio/0.1

### Camera dei Deputati (per confronto)
- **Ontologia OCD**: https://dati.camera.it/ocd-ontologia-della-camera-dei-deputati
- **SPARQL Endpoint**: https://dati.camera.it/sparql
- **Differenze**: Vedi `03-differenze-camera-senato.md`

---

## 💡 Tips & Best Practices

### 1. Usa Sempre foaf:lastName
```sparql
# ✅ Corretto per Senato
?senatore foaf:lastName ?cognome .

# ❌ Sbagliato (è Camera)
?senatore foaf:surname ?cognome .
```

### 2. Legislature come Integer
```sparql
# ✅ Corretto
?mandato osr:legislatura 19 .

# ❌ Sbagliato (è Camera)
?mandato osr:legislatura <http://...> .
```

### 3. Filtra Date Correttamente
```sparql
# ✅ Conversione esplicita
FILTER(xsd:date(str(?data)) >= xsd:date("2023-01-01"))

# ⚠️ Dipende dai dati
FILTER(?data >= "2023-01-01"^^xsd:date)
```

### 4. OPTIONAL vs FILTER
```sparql
# ✅ Per campi opzionali
OPTIONAL { ?mandato osr:fine ?fine }

# ✅ Per filtrare valori bound
FILTER(!bound(?fine))
```

### 5. Limita Risultati
```sparql
# ✅ Sempre nelle query esplorative
LIMIT 100

# ✅ Ordina prima di limitare
ORDER BY DESC(?data)
LIMIT 50
```

---

## 🐛 Troubleshooting

### Query Non Restituisce Risultati

**Check 1**: Stai usando `foaf:lastName` e non `foaf:surname`?
```sparql
# ✅ Senato
foaf:lastName

# ❌ Camera
foaf:surname
```

**Check 2**: Legislatura è un numero e non URI?
```sparql
# ✅ Senato
osr:legislatura 19

# ❌ Camera
ocd:rif_leg <http://...>
```

**Check 3**: Proprietà date corrette?
```sparql
# ✅ Senato
osr:inizio, osr:fine

# ❌ Camera
ocd:startDate, ocd:endDate
```

### Timeout Query

**Soluzione 1**: Aggiungi LIMIT
```sparql
LIMIT 100  # Inizia con piccoli set
```

**Soluzione 2**: Filtra per legislatura
```sparql
?mandato osr:legislatura 19 .  # Solo legislatura corrente
```

**Soluzione 3**: Usa date range
```sparql
FILTER(xsd:date(str(?data)) >= xsd:date("2023-01-01"))
```

---

## 🖼️ Diagramma Ontologia

### Generazione Diagramma

Per generare un diagramma visuale dell'ontologia Senato:

**Opzione 1: WebVOWL (Raccomandato)**
1. Vai a http://vowl.visualdataweb.org/webvowl.html
2. Carica ontologia OSR dal Senato
3. Esplora interattivamente classi e proprietà (20+ classi, 90+ proprietà)
4. Esporta come SVG e salva in `/docs/senato/ontology-diagram.svg`

**Opzione 2: Online RDF Converter**
1. Vai a http://www.easyrdf.org/converter
2. Input: URL ontologia Senato
3. Output format: SVG Graph
4. Salva risultato

**Opzione 3: Protégé**
1. Scarica Protégé: https://protege.stanford.edu/
2. Apri ontologia OSR dal Senato
3. Usa OntoGraf plugin per visualizzazioni personalizzate

### Struttura Principale

```
Legislatura (centro) - come numero intero!
├── Senatore
│   ├── Mandato
│   ├── Gruppo Parlamentare (usa classi OCD!)
│   └── Commissione
├── DDL (Disegno di Legge)
│   ├── Iter
│   │   ├── FaseIter
│   │   ├── Assegnazione
│   │   └── Relatore
│   ├── Iniziativa (presentatori)
│   └── Emendamento
├── Votazione
│   ├── Seduta Assemblea
│   └── Espressione Voto
└── Commissione
    └── Seduta Commissione
```

---

## 📞 Support

Per problemi con:
- **Endpoint/Dati**: Contatta dati@senato.it
- **RepublicMCP**: Apri issue su GitHub
- **Documentazione**: PR benvenute!

---

## 📄 Licenza

- **Dati Senato**: Creative Commons Attribution 3.0
- **Questa Documentazione**: Parte di RepublicMCP

---

**Ultimo aggiornamento**: 2025-11-12
**Versione Documentazione**: 2.0.0

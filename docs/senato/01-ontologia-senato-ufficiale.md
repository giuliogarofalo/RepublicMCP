# OSR - Ontologia del Senato della Repubblica

**Source:** https://dati.senato.it/DatiSenato/browse/21

## Overview
The OSR (Ontologia del Senato della Repubblica) is an RDF-based ontology developed by the Italian Senate to formally describe parliamentary resources, processes, and activities. It is coordinated with the Camera dei Deputati ontology (OCD) for interoperability.

**Base URI:** `http://dati.senato.it/osr/`
**License:** Creative Commons Attribution 3.0
**Formats:** RDF/XML, Turtle
**SPARQL Endpoint:** https://dati.senato.it/sparql

## Core Concepts

### Primary Entity Classes (20 Total)

The ontology is organized around these core entity types:

- **Personnel:**
  - `Senatore` (senators)

- **Legislative Bodies:**
  - `Commissione` (commissions)
  - `ConsiglioDiPresidenza` (presidency council)

- **Acts & Documents:**
  - `Ddl` (Disegni di Legge - bills)
  - `Atto` (generic acts)
  - `Documento` (non-legislative documents)
  - `SindacatoIspettivo` (oversight documents - questions, interpellations)

- **Legislative Process:**
  - `IterDdl` (bill lifecycle/iteration)
  - `FaseIter` (iteration phases)
  - `Assegnazione` (committee assignments)
  - `Iniziativa` (initiatives - bill sponsors/signatories)
  - `Relatore` (rapporteurs)
  - `Emendamento` (amendments)
  - `Procedura` (procedures)

- **Parliamentary Activity:**
  - `SedutaAssemblea` (assembly sessions)
  - `SedutaCommissione` (commission sessions)
  - `Votazione` (voting)
  - `Intervento` (speeches/interventions)
  - `OggettoTrattazione` (discussion items)

- **Supporting:**
  - `Denominazione` (naming/denomination for groups and commissions)

## Senatore (Senator) Class

### Properties

**Identification & Personal:**
- Uses **FOAF ontology** for biographical data (extends `foaf:Person`)
- `foaf:firstName` - First name
- `foaf:lastName` - Last name ⚠️ **Different from Camera** (Camera uses `foaf:surname`)
- `foaf:depiction` - Photo URL

**Birth Information:**
- `nazioneNascita` (rdfs:Literal) - Birth nation
- `provinciaNascita` (rdfs:Literal) - Birth province
- `cittaNascita` (rdfs:Literal) - Birth city
- Uses **BIO ontology** (`bio:Birth`, `bio:Death`)

**Residence:**
- `nazioneResidenza` (rdfs:Literal) - Residence nation
- `provinciaResidenza` (rdfs:Literal) - Residence province
- `cittaResidenza` (rdfs:Literal) - Residence city

**Parliamentary Activity:**
- `mandato` (ocd:mandatoSenato) - Links to mandate ⚠️ **Uses Camera ontology class**
- `carica` (xsd:string) - Position/role
- `interviene` (osr:Intervento) - Links to speeches/interventions

### Relationships
- Links to `ocd:mandatoSenato` (mandate from Camera ontology)
- Links to `ocd:gruppoParlamentare` (parliamentary groups - shared with Camera)
- Links to `Commissione` via commission membership

## Mandato (Mandate)

⚠️ **Important:** The OSR ontology references the **Camera dei Deputati** ontology class `ocd:mandatoSenato` instead of defining its own mandate class.

**Expected properties** (from practical queries):
- `osr:legislatura` (xsd:integer) - Legislature number (17, 18, 19) ⚠️ **Different from Camera** (Camera uses URI)
- `osr:inizio` (xsd:date) - Mandate start date
- `osr:fine` (xsd:date, optional) - Mandate end date (absent if still in office)
- `osr:tipoMandato` (xsd:string) - Mandate type:
  - "ordinario" (elected senator)
  - "a vita, di nomina del Presidente della Repubblica" (life senator by presidential appointment)
  - "di diritto e a vita, Presidente emerito della Repubblica" (life senator by right - former president)
- `osr:dataNomina` (xsd:date) - Appointment date (for life senators)
- `osr:tipoFineMandato` (xsd:string, optional) - Reason for mandate end

## Ddl (Disegno di Legge - Bill) Class

### Properties

**Identification:**
- `idDdl` (xsd:integer) - Bill ID
- `idFase` (xsd:string) - Phase ID
- `numeroFase` (xsd:string) - Phase number
- `numeroFaseCompatto` (xsd:string) - Compact phase number (for sorting)
- `ramo` (xsd:string) - Chamber branch (Senato/Camera)

**Description:**
- `titolo` (xsd:string) - Full title
- `titoloBreve` (xsd:string, optional) - Short title
- `natura` (rdfs:Literal) - Nature/type of bill

**Legislative Context:**
- `legislatura` (xsd:date) - Legislature (date-based reference)
- `fase` (xsd:string) - Current phase

**Status & Dates:**
- `presentatoTrasmesso` (xsd:string) - Whether presented or transmitted
- `dataPresentazione` (xsd:date) - Presentation date
- `statoDdl` (xsd:string) - Bill status
- `dataStatoDdl` (xsd:date) - Status date

**Documents:**
- `URLTesto` (xsd:string) - Text URL
- `testoPresentato` (xsd:string, optional) - Link to presented text
- `testoApprovato` (xsd:string, optional) - Link to approved text

### Relationships
- `assegnazione` (osr:Assegnazione) - Committee assignments
- `relatore` (osr:Relatore) - Rapporteurs
- `iniziativa` (osr:Iniziativa) - Bill sponsors/signatories
- `iter` (osr:IterDdl) - Bill lifecycle

## Iniziativa (Initiative - Bill Sponsors) Class

Represents bill signatories and sponsors.

### Properties
- `presentatore` (URI) - Presenter/signatory (senator URI)
- `primoFirmatario` (boolean) - Whether first signatory
- `dataAggiuntaFirma` (xsd:date, optional) - Date signature added
- `dataRitiroFirma` (xsd:date, optional) - Date signature withdrawn

## IterDdl (Bill Lifecycle) Class

Tracks the complete legislative iteration of a bill.

### Properties
- `idDdl` (xsd:integer) - Referenced bill ID

### Relationships
- `fase` (osr:FaseIter) - Links to iteration phases

## FaseIter (Iteration Phase) Class

Represents a specific phase in the bill's legislative process.

### Properties
- `progrIter` (xsd:integer) - Iteration progressive number
- `ddl` - Reference to bill phase with:
  - `ramo` - Chamber
  - `numeroFase` - Phase number
  - `statoDdl` - Status
  - `dataStatoDdl` - Status date

## Votazione (Voting) Class

### Properties

**Identification:**
- `numero` (xsd:string) - Vote number
- `legislatura` (xsd:date) - Legislature reference

**Context:**
- `seduta` (osr:Seduta) - Links to session
- `oggetto` (osr:OggettoTrattazione) - Discussion item
- Label via `rdfs:label` - Vote subject

**Vote Counts (aggregated):**
- `presenti` (xsd:integer) - Present senators
- `votanti` (xsd:integer) - Voting senators
- `favorevoli` (xsd:integer) - Votes in favor
- `contrari` (xsd:integer) - Votes against
- `astenuti` (xsd:integer) - Abstentions
- `maggioranza` (xsd:integer) - Required majority
- `numeroLegale` (xsd:integer) - Legal quorum

**Individual Votes:**
- `favorevole` (osr:Senatore) - Senator voting in favor
- `contrario` (osr:Senatore) - Senator voting against
- `astenuto` (osr:Senatore) - Senator abstaining
- `inCongedoMissione` (xsd:integer/osr:Senatore) - Senators on leave/mission

**Classification:**
- `tipoVotazione` (xsd:string) - Vote type
- `esito` (xsd:string) - Vote result

## Seduta (Session) Classes

### SedutaAssemblea (Assembly Session)
- `numeroSeduta` (xsd:integer) - Session number
- `dataSeduta` (xsd:date) - Session date
- `legislatura` (xsd:integer) - Legislature number

### SedutaCommissione (Commission Session)
Similar properties for commission meetings.

## Commissione (Commission) Class

### Properties
- `categoriaCommissione` (xsd:string) - Commission category
- `ordinale` (xsd:string) - Ordinal number
- `titolo` (xsd:string) - Title
- `sottotitolo` (xsd:string, optional) - Subtitle

### Relationships
- `denominazione` (osr:Denominazione) - Links to denomination with:
  - `osr:titolo` - Commission name
  - `osr:fine` (optional) - End date of denomination

## Gruppo Parlamentare (Parliamentary Group)

⚠️ **Important:** The Senate uses the **Camera dei Deputati** ontology for parliamentary groups: `ocd:gruppoParlamentare`

### Properties
- Uses `osr:Denominazione` for naming
  - `osr:titolo` - Group name
  - `osr:fine` (optional) - End date of denomination

### Membership (Afferenza/Adesione)
- `ocd:aderisce` - Senator joins group (uses Camera ontology property)
- `ocd:adesioneGruppo` - Group membership instance
  - `osr:carica` - Position in group
  - `osr:inizio` - Membership start date
  - `osr:fine` (optional) - Membership end date
  - `osr:gruppo` - Links to `ocd:gruppoParlamentare`

## Afferenza (Commission Membership)

Represents senator membership in commissions.

### Properties
- `osr:commissione` (osr:Commissione) - Links to commission
- `osr:inizio` (xsd:date) - Membership start date
- `osr:fine` (xsd:date, optional) - Membership end date
- `osr:carica` (xsd:string) - Position/role in commission

## Intervento (Intervention/Speech) Class

Represents speeches and interventions by senators.

### Properties
Not fully documented in official ontology, but expected:
- Links to `Senatore` (speaker)
- Links to session/debate context
- Text or reference to transcript

## Documento (Document) Class

Non-legislative documents.

### Properties
- `numeroDoc` (xsd:string) - Document number
- `tipo` (xsd:string) - Document type

## Additional Supporting Classes

### Emendamento (Amendment)
Amendments to bills (properties not fully detailed in schema).

### Procedura (Procedure)
Parliamentary procedures.

### OggettoTrattazione (Discussion Item)
Items discussed in sessions.

### Classificazione
Classification/categorization system (most numerous entity type with 869,980 instances).

### SindacatoIspettivo (Oversight)
Parliamentary oversight activities (questions, interpellations).

### Assegnazione (Assignment)
Committee assignments for bills.

## Key Relationships & Object Properties

**Legislative Process:**
- `fase` - Links to iteration phases
- `assegnazione` - Committee assignment
- `relatore` - Rapporteur designation
- `iniziativa` - Bill sponsorship

**Membership & Organization:**
- `mandato` - Links senator to mandate
- `aderisce` - Group membership
- `afferisce` - Commission membership
- `interviene` - Speech participation

**Temporal Properties:**
- Date ranges throughout with start/end patterns
- `inizio` - Start date
- `fine` - End date (optional, absent if active)
- Various date properties: `dataPresentazione`, `dataSeduta`, `dataNomina`, etc.

## Integration with Camera dei Deputati Ontology

The Senate ontology deliberately reuses Camera ontology elements for consistency:

| Element | Namespace | Notes |
|---------|-----------|-------|
| **Parliamentary Groups** | `ocd:gruppoParlamentare` | Shared |
| **Group Membership** | `ocd:aderisce`, `ocd:adesioneGruppo` | Shared |
| **Mandate** | `ocd:mandatoSenato` | Camera namespace |

## Key Differences from Camera Ontology (OCD)

| Aspect | Camera (OCD) | Senato (OSR) |
|--------|--------------|--------------|
| **Prefix** | `ocd:` | `osr:` |
| **Member Entity** | `ocd:deputato` | `osr:Senatore` |
| **Last Name Property** | `foaf:surname` | `foaf:lastName` ⚠️ |
| **Legislature Type** | URI reference | Integer (17, 18, 19) ⚠️ |
| **Mandate Class** | `ocd:mandatoCamera` | `ocd:mandatoSenato` (Camera namespace!) |
| **Bill Entity** | `ocd:atto` | `osr:Ddl` |
| **Groups** | `ocd:gruppoParlamentare` | `ocd:gruppoParlamentare` ✅ Same |

## Common SPARQL Patterns

### Current Senators

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?nome ?cognome ?legislatura
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura ?legislatura ;
        osr:inizio ?inizioMandato .

    OPTIONAL { ?mandato osr:fine ?fineMandato }
    FILTER(!bound(?fineMandato))
}
ORDER BY ?cognome ?nome
```

### Senators by Legislature

```sparql
?mandato osr:legislatura 19 .  # XIX Legislature (2022-present)
```

### Life Senators

```sparql
?mandato osr:tipoMandato ?tipo .
FILTER(
    ?tipo = "a vita, di nomina del Presidente della Repubblica" ||
    ?tipo = "di diritto e a vita, Presidente emerito della Repubblica"
)
```

### Current Commission Membership

```sparql
?senatore osr:afferisce ?afferenza .
?afferenza osr:commissione ?commissione ;
    osr:inizio ?inizioAfferenza .

OPTIONAL { ?afferenza osr:fine ?fineAfferenza }
FILTER(!bound(?fineAfferenza))

?commissione osr:denominazione ?den .
?den osr:titolo ?nomeCommissione .
OPTIONAL { ?den osr:fine ?fineDen }
FILTER(!bound(?fineDen))
```

### Current Parliamentary Group Membership

```sparql
?senatore ocd:aderisce ?adesioneGruppo .
?adesioneGruppo osr:gruppo ?gruppo ;
    osr:inizio ?inizioAdesione .

OPTIONAL { ?adesioneGruppo osr:fine ?fineAdesione }
FILTER(!bound(?fineAdesione))

?gruppo osr:denominazione ?den .
?den osr:titolo ?nomeGruppo .
```

### Bills with Dates

```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT ?ddl ?titolo ?dataPres ?stato ?dataStato
WHERE {
    ?ddl a osr:Ddl ;
        osr:legislatura ?leg ;
        osr:titolo ?titolo ;
        osr:dataPresentazione ?dataPres ;
        osr:statoDdl ?stato ;
        osr:dataStatoDdl ?dataStato .

    FILTER(xsd:date(str(?dataPres)) >= xsd:date("2022-10-13"))
}
ORDER BY DESC(?dataPres)
LIMIT 100
```

### Bills by Senator

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?ddl ?titolo ?primoFirmatario
WHERE {
    ?senatore a osr:Senatore ;
        foaf:lastName "SALVINI" ;
        foaf:firstName "Matteo" .

    ?iniziativa osr:presentatore ?senatore .

    ?ddl a osr:Ddl ;
        osr:iniziativa ?iniziativa ;
        osr:titolo ?titolo .

    OPTIONAL { ?iniziativa osr:primoFirmatario ?primoFirmatario }
}
ORDER BY DESC(?primoFirmatario)
```

### Voting Results

```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT ?votazione ?oggetto ?esito ?favorevoli ?contrari ?astenuti
WHERE {
    ?votazione a osr:Votazione ;
        osr:seduta ?seduta ;
        rdfs:label ?oggetto ;
        osr:esito ?esito ;
        osr:favorevoli ?favorevoli ;
        osr:contrari ?contrari ;
        osr:astenuti ?astenuti .

    ?seduta osr:dataSeduta ?data ;
        osr:legislatura 19 .

    FILTER(xsd:date(str(?data)) >= xsd:date("2023-01-01"))
}
ORDER BY DESC(?data)
LIMIT 50
```

## Common Filters

```sparql
# Active mandate (no end date)
FILTER(!bound(?fineMandato))

# Date range
FILTER(xsd:date(str(?data)) >= xsd:date("2022-10-13"))
FILTER(xsd:date(str(?data)) <= xsd:date("2024-12-31"))

# Specific legislature
FILTER(?legislatura = 19)  # Integer comparison

# Name search (case-insensitive)
FILTER(REGEX(?cognome, "SALVINI", "i"))
```

## Available Legislatures

- **XIX Legislature** (19): 2022-present (current)
- **XVIII Legislature** (18): 2018-2022
- **XVII Legislature** (17): 2013-2018
- **XVI Legislature** (16): 2008-2013
- Previous legislatures also available

## TypeScript Type Mappings

```typescript
interface Senatore {
  uri: string;
  firstName: string;
  lastName: string;  // NOT surname!
  birthDate?: string;
  birthCity?: string;
  birthProvince?: string;
  birthCountry?: string;
  residenceCity?: string;
  residenceProvince?: string;
  residenceCountry?: string;
  photo?: string;
  mandates: Mandate[];
  commissions?: CommissionMembership[];
  groups?: GroupMembership[];
}

interface Mandate {
  uri: string;
  legislature: number;  // Integer, not URI!
  start: string;  // ISO date
  end?: string;   // ISO date, optional
  type: string;   // "ordinario" | "a vita, di nomina..." | "di diritto..."
  nominationDate?: string;  // For life senators
  endReason?: string;
}

interface Ddl {
  uri: string;
  idDdl: number;
  idFase: string;
  ramo: string;  // "Senato" | "Camera"
  legislature: string;  // Date-based
  numeroFase: string;
  title: string;
  shortTitle?: string;
  nature: string;
  presentedOrTransmitted: string;
  presentationDate: string;
  status: string;
  statusDate: string;
  presentedText?: string;
  approvedText?: string;
  sponsors: Initiative[];
  iter?: IterDdl;
}

interface Initiative {
  presenter: string;  // Senator URI
  firstSignatory: boolean;
  signatureAddedDate?: string;
  signatureWithdrawnDate?: string;
}

interface Votazione {
  uri: string;
  numero: string;
  legislature: string;
  session: {
    numero: number;
    data: string;
  };
  oggetto: string;
  esito: string;
  presenti: number;
  votanti: number;
  favorevoli: number;
  contrari: number;
  astenuti: number;
  maggioranza: number;
  numeroLegale: number;
  tipoVotazione?: string;
}

interface CommissionMembership {
  commission: {
    uri: string;
    title: string;
    category?: string;
    ordinal?: string;
  };
  start: string;
  end?: string;
  position?: string;  // carica
}

interface GroupMembership {
  group: {
    uri: string;
    name: string;
  };
  start: string;
  end?: string;
  position?: string;  // carica
}
```

## Data Quality Notes

- **Completeness:** Data availability varies by legislature
- **Updates:** Real-time updates for current legislature (XIX)
- **Historical Data:** Coverage back to earlier legislatures
- **Consistency:** Coordinated with Camera ontology for cross-chamber queries
- **Identifiers:** Stable URIs for persistent referencing

## Access Points

- **SPARQL Endpoint:** https://dati.senato.it/sparql
- **Ontology Documentation:** https://dati.senato.it/DatiSenato/browse/21
- **License:** CC BY 3.0
- **Data Formats:** RDF/XML, Turtle, JSON-LD (via content negotiation)

## Implementation Notes

### ⚠️ Critical Differences for Queries

1. **Last Name Property:**
   - Camera: `foaf:surname`
   - Senato: `foaf:lastName`

2. **Legislature Format:**
   - Camera: `<http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>`
   - Senato: `19` (integer literal)

3. **Namespace Mixing:**
   - Parliamentary groups use Camera namespace (`ocd:gruppoParlamentare`)
   - Mandates use Camera namespace (`ocd:mandatoSenato`)
   - Everything else uses Senate namespace (`osr:`)

4. **Active Status Pattern:**
   - Use `FILTER(!bound(?fine))` for current memberships/mandates
   - All temporal relationships have optional end dates

5. **Date Handling:**
   - All dates use `xsd:date` format
   - Convert with `xsd:date(str(?date))` for filtering

## Entity Count Summary

Based on endpoint exploration (approximate counts):

1. **Classificazione**: 869,980
2. **Iniziativa**: 837,373
3. **Emendamento**: 695,394
4. **Assegnazione**: 359,968
5. **Intervento**: 295,746
6. **Atto**: 170,491
7. **SedutaCommissione**: 73,205
8. **FaseIter**: 72,552
9. **SindacatoIspettivo**: 65,118
10. **Relatore**: 54,595

## Resources

- **Official Documentation:** https://dati.senato.it/DatiSenato/browse/21
- **SPARQL Endpoint:** https://dati.senato.it/sparql
- **License:** Creative Commons Attribution 3.0
- **Format Specifications:** RDF/XML, Turtle
- **Integration Guide:** See Camera ontology for shared elements

This ontology enables systematic querying of Senate parliamentary history—tracking senator careers, legislative processes, voting records, and institutional evolution.

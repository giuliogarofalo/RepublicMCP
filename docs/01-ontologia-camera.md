# OCD - Ontologia della Camera dei Deputati

**Source:** https://dati.camera.it/ocd-ontologia-della-camera-dei-deputati

## Overview
The OCD (Ontologia della Camera dei Deputati) is an RDF-based OWL ontology developed by the Italian Chamber of Deputies to formally describe parliamentary resources, processes, and activities from 1848 to present.

**Base URI:** `http://dati.camera.it/ocd/`
**License:** Creative Commons Attribution 4.0
**Current Version:** May 2, 2013 (with updates through November 21, 2014)

## Core Concepts

### Primary Entity Classes

The ontology centers on **legislatura** (parliamentary term), which organizes all parliamentary activities into:

- **Deputies & Personnel:**
  - `deputato` (deputies)
  - `senatore` (senators)
  - `persona` (generic persons)
  - `membroGoverno` (government members)

- **Legislative Bodies:**
  - `assemblea` (assembly)
  - `organo` (parliamentary organs)
  - `gruppoParlamentare` (parliamentary groups)

- **Acts & Documents:**
  - `atto` (bills/proposals)
  - `DOC` (parliamentary documents)
  - `dossier`
  - `aic` (control/oversight acts)

- **Procedures:**
  - `seduta` (sessions)
  - `discussione` (discussions)
  - `votazione` (voting)
  - `elezione` (elections)

- **Government:**
  - `governo` (government)
  - `organoGoverno` (government bodies)
  - `presidenteConsiglioMinistri` (Prime Minister)

### Key Relationships

**Object Properties** connect entities:
- `aderisce` - deputy joining parliamentary group
- `rif_attoCamera` - references between acts
- `rif_governo` - links to government
- `siComponeDi` - composition relationships (assemblies, groups, legislatures)
- `membro` - membership in organs
- `rif_leg` - connects resources to specific legislature

**Datatype Properties** specify attributes:
- Date ranges: `startDate`, `endDate`
- Voting data: `favorevoli` (votes for), `contrari` (against), `astenuti` (abstentions)
- Status indicators: `costituzionale` (constitutional bill), `concluso` (concluded)
- Election data: `convalida` (validation date)

## Document Classification

Documents subdivide into:
- **Legislation:** `atto` (bills), `legge` (laws)
- **Administrative:** `DOC`, `documentazione`, `dossier`
- **Reference Materials:** `normativa` (regulations), `dottrina` (doctrine), `giurisprudenza` (jurisprudence), `pubblicistica` (publications)
- **Parliamentary Activity:** `dibattito` (debates), `discussione` (discussions), `intervento` (speeches)

## Procedural Structure

**Legislative Process Elements:**
- `abbinamento` - bill bundling
- `assegnazione` - committee assignment
- `trasmissione` - transmission to other chamber
- `statoIter` - procedural status
- `rif_versioneTestoAtto` - text version tracking
- `richiestaParere` - opinion requests

## Electoral System

The ontology models elections through:
- `elezione` - election records
- `sistemaElettorale` - electoral systems (proportional, majoritarian, mixed)
- `mandatoCamera` - deputy mandates with validation dates
- `circoscrizionePlurieletto` - multi-member districts
- `lista` - candidate lists
- `opzione` - candidacy options

## Governance Integration

Government representation includes:
- `delegatoRispondere` - delegates responding to parliamentary inquiries (added 2014)
- `firmaAIC` - signatures on oversight acts
- `membroGoverno` - government positions held by deputies
- Time-stamped delegation data (`dataDelega`, `dataFineDelega`)

## Specialized Features

**Parliamentary Groups:**
- `cambioDenominazione` - name changes
- `trasformazioneGruppo` - mergers, splits, promotions
- `componenteGruppoMisto` - mixed group components
- `adesioneGruppo`, `adesioneGruppoMisto` - membership tracking

**Administrative Structure:**
- `ufficioParlamentare` - parliamentary offices
- `unitaOrganizzativa` - organizational units
- `incarico` - positions within groups
- `appartenenzaOrgano` - organ membership with roles

## Data Quality Features

- **Tracking:** Revision dates, status changes, procedural milestones
- **Geographic:** `luogo` (location) class with administrative hierarchies
- **Temporal:** Session (`sessioneLegislatura`) management
- **Thematic:** `griglia` property links to TheCa thematic grids via SKOS concepts

## Technical Implementation

The ontology uses:
- RDF triple representation
- Qualified relationships (classes like `abbinamento`, `assegnazione` capturing relational metadata)
- Subclass hierarchies (e.g., `membroGoverno` extends `persona`)
- Cardinality constraints on properties
- Integration with Dublin Core metadata elements

## Access Points

- **RDF File:** `http://dati.camera.it/ocd/classi.rdf`
- **Documentation:** Interactive class/property definitions with usage notes
- **Integration:** Links to camera.it institutional pages explaining parliamentary concepts

This ontology enables querying parliamentary history systematically—tracking deputy careers, legislative genealogy, government composition, and procedural evolution across 170+ years.

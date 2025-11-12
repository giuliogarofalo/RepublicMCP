# Senato della Repubblica - Ontology Diagram

## TypeScript Type System Overview

This diagram represents the TypeScript type system based on the OSR (Ontologia Senato Repubblica) ontology.

```mermaid
classDiagram
    %% Core Entities
    class Senatore {
        +string uri
        +string firstName
        +string lastName ⚠️ NOT surname
        +string? gender
        +string? photo
        +string? birthDate
        +string? birthCity
        +string? birthProvince
        +string? residenceCity
        +Mandato[] mandates
        +AfferenzaCommissione[] commissions
        +AdesioneGruppo[] groups
    }

    class Mandato {
        +string? uri
        +number legislature ⚠️ Integer not URI
        +string start
        +string? end
        +MandateType type
        +string? nominationDate
        +string? endReason
        +string? electionRegion
    }

    %% Bills and Legislative Process
    class Ddl {
        +string uri
        +number idDdl
        +string ramo
        +string legislature
        +string titolo
        +string? titoloBreve
        +string presentatoTrasmesso
        +string dataPresentazione
        +string statoDdl
        +Iniziativa[] iniziative
        +IterDdl? iter
        +Assegnazione[] assegnazioni
    }

    class Iniziativa {
        +string? uri
        +string presentatore
        +boolean primoFirmatario
        +string? dataAggiuntaFirma
        +string? dataRitiroFirma
    }

    class IterDdl {
        +string? uri
        +number idDdl
        +FaseIter[] fasi
    }

    class FaseIter {
        +string? uri
        +number progrIter
        +object ddlRef
    }

    %% Voting
    class Votazione {
        +string uri
        +string numero
        +string legislature
        +object seduta
        +string oggetto
        +string esito
        +number presenti
        +number votanti
        +number favorevoli
        +number contrari
        +number astenuti
        +string[] votiFavorevoli
        +string[] votiContrari
        +string[] votiAstenuti
    }

    %% Commissions and Groups
    class Commissione {
        +string uri
        +string? categoriaCommissione
        +string? ordinale
        +string? titolo
        +object? denominazione
    }

    class AfferenzaCommissione {
        +string? uri
        +string commissione
        +string inizio ⚠️ OSR property
        +string? fine ⚠️ OSR property
        +string? carica
    }

    class GruppoParlamentare {
        +string uri ⚠️ Uses OCD namespace
        +object denominazione
    }

    class AdesioneGruppo {
        +string? uri ⚠️ OCD class
        +string gruppo
        +string inizio ⚠️ OSR property
        +string? fine ⚠️ OSR property
        +string? carica
    }

    %% Other Entities
    class Intervento {
        +string uri
        +string senatore
    }

    class Emendamento {
        +string uri
        +string? relativoA
    }

    class Assegnazione {
        +string uri
        +string? commissione
        +string? dataAssegnazione
    }

    class Relatore {
        +string uri
        +string senatore
        +string? commissione
    }

    class Documento {
        +string uri
        +string? numeroDoc
        +string? tipo
    }

    %% Relationships
    Senatore --> Mandato : has
    Senatore --> AfferenzaCommissione : member of
    Senatore --> AdesioneGruppo : member of
    Senatore --> Intervento : makes
    Ddl --> Iniziativa : sponsored by
    Iniziativa --> Senatore : presenter
    Ddl --> IterDdl : lifecycle
    IterDdl --> FaseIter : phases
    Ddl --> Assegnazione : assigned to
    Ddl --> Emendamento : amended by
    Assegnazione --> Commissione : commission
    Relatore --> Senatore : rapporteur
    Relatore --> Commissione : commission
    AfferenzaCommissione --> Commissione : commission
    AdesioneGruppo --> GruppoParlamentare : group ⚠️ OCD class
    Votazione --> Senatore : voters

    %% Styling
    class Senatore,Ddl,Votazione,Commissione,GruppoParlamentare main-entity
    classDef main-entity fill:#ffe1e1,stroke:#cc0000,stroke-width:3px
```

## Key Characteristics

### ⚠️ Senato-Specific Features

1. **Cognome**: Uses `foaf:lastName` (NOT `foaf:surname`)
2. **Legislature**: Integer format `19` (NOT URI)
3. **Date Properties**: `osr:inizio`, `osr:fine` (NOT `startDate`, `endDate`)
4. **Parliamentary Groups**: Uses Camera ontology classes (`ocd:gruppoParlamentare`, `ocd:adesioneGruppo`) but with OSR properties

### 🔄 Hybrid Approach

The Senato ontology reuses Camera's parliamentary group classes:
- **Class**: `ocd:adesioneGruppo` (Camera)
- **Properties**: `osr:gruppo`, `osr:inizio`, `osr:fine` (Senato)

## Core Classes

| Class | Description | Key Properties |
|-------|-------------|----------------|
| **Senatore** | Senator | lastName, firstName, mandates, commissions |
| **Ddl** | Bill (Disegno di Legge) | titolo, dataPresentazione, iniziative, iter |
| **Votazione** | Voting | oggetto, esito, favorevoli, contrari |
| **Commissione** | Commission | titolo, ordinale, denominazione |
| **GruppoParlamentare** | Parliamentary Group (OCD) | denominazione |
| **IterDdl** | Bill Lifecycle | idDdl, fasi |
| **Iniziativa** | Bill Sponsorship | presentatore, primoFirmatario |

## Mandate Types

```typescript
type MandateType =
  | 'ordinario' // Elected senator
  | 'a vita, di nomina del Presidente della Repubblica' // Life senator by appointment
  | 'di diritto e a vita, Presidente emerito della Repubblica' // Life senator (former president)
```

## Hierarchy

```
Legislatura (19 - integer!)
├── Senatore
│   ├── Mandato
│   ├── AfferenzaCommissione → Commissione
│   └── AdesioneGruppo → GruppoParlamentare (OCD)
├── Ddl
│   ├── Iniziativa → Senatore
│   ├── IterDdl → FaseIter
│   ├── Assegnazione → Commissione
│   ├── Relatore → Senatore
│   └── Emendamento
└── Votazione
    └── Individual votes (Senator URIs)
```

## Usage in RepublicMCP

These TypeScript types are used throughout the codebase:
- `src/institutions/senato/ontology/types.ts` - Type definitions
- `src/institutions/senato/queries/*.ts` - SPARQL query builders
- `src/institutions/senato/tools/*.ts` - MCP tool implementations

## Example Type Usage

```typescript
import { Senatore, SenatoreSearchParams } from './ontology/types';

const searchParams: SenatoreSearchParams = {
  lastName: 'Salvini',  // ⚠️ NOT surname!
  legislature: 19,      // ⚠️ Integer, NOT URI!
  active: true,
  limit: 10
};

// Query returns Senatore[]
const senatori: Senatore[] = await client.searchSenators(searchParams);
```

## Comparison with Camera

| Feature | Camera (OCD) | Senato (OSR) |
|---------|--------------|--------------|
| **Cognome** | `foaf:surname` | `foaf:lastName` |
| **Legislature** | URI | Integer |
| **Date Start** | `ocd:startDate` | `osr:inizio` |
| **Date End** | `ocd:endDate` | `osr:fine` |
| **Groups** | OCD classes & properties | OCD classes + OSR properties |

---

**Generated from**: `src/institutions/senato/ontology/types.ts`
**Last updated**: 2025-11-12
